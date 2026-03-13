from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import pandas as pd
import io
import math

from ..database import get_db
from ..models.content import Content
from ..models.user import User
from ..models.user_progress import UserProgress
from ..models.user_task_log import UserTaskLog
from ..schemas import (
    ContentCreate, ContentResponse,
    ContentProgressItem, UserProgressItem,
    PaginatedContent, PaginatedContentProgress, PaginatedUserProgress,
)
from ..services.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])
VALID_PLATFORMS = ["x_post", "x_retweet", "facebook_post"]


@router.post("/content", response_model=ContentResponse)
def create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if content_data.platform_type not in VALID_PLATFORMS:
        raise HTTPException(status_code=400, detail="Invalid platform type")
    content = Content(content=content_data.content, platform_type=content_data.platform_type)
    db.add(content)
    db.commit()
    db.refresh(content)
    for user in db.query(User).filter(User.role == "user").all():
        if user.progress:
            user.progress.remaining += 1
        else:
            db.add(UserProgress(user_id=user.id, completed=0, remaining=1))
    db.commit()
    return content


@router.post("/upload-excel")
def upload_excel(
    file: UploadFile = File(...),
    platform_type: str = Form(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if platform_type not in VALID_PLATFORMS:
        raise HTTPException(status_code=400, detail="Invalid platform type")
    raw = file.file.read()
    try:
        df = pd.read_excel(io.BytesIO(raw))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {e}")
    if "content" not in df.columns:
        raise HTTPException(status_code=400, detail="Excel must have a 'content' column")
    rows = df["content"].dropna().tolist()
    if not rows:
        raise HTTPException(status_code=400, detail="No content rows found")
    created = [Content(content=str(r), platform_type=platform_type) for r in rows]
    db.add_all(created)
    db.commit()
    for user in db.query(User).filter(User.role == "user").all():
        if user.progress:
            user.progress.remaining += len(created)
        else:
            db.add(UserProgress(user_id=user.id, completed=0, remaining=len(created)))
    db.commit()
    return {"message": f"Uploaded {len(created)} items", "count": len(created)}


@router.get("/content", response_model=PaginatedContent)
def get_all_content(
    platform:  Optional[str] = Query(None),
    page:      int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Content)
    if platform and platform in VALID_PLATFORMS:
        q = q.filter(Content.platform_type == platform)
    q = q.order_by(Content.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedContent(
        items=items, total=total, page=page,
        page_size=page_size, total_pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/content-progress", response_model=PaginatedContentProgress)
def get_content_progress(
    page:      int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    base = (
        db.query(
            Content.id.label("content_id"),
            Content.content,
            Content.platform_type,
            func.count(UserTaskLog.id).label("completed_users"),
        )
        .outerjoin(UserTaskLog, Content.id == UserTaskLog.content_id)
        .group_by(Content.id, Content.content, Content.platform_type)
        .order_by(Content.created_at.desc())
    )
    total = db.query(Content).count()
    results = base.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedContentProgress(
        items=[
            ContentProgressItem(
                content_id=r.content_id, content=r.content,
                platform_type=r.platform_type, completed_users=r.completed_users,
            )
            for r in results
        ],
        total=total, page=page,
        page_size=page_size, total_pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/user-progress", response_model=PaginatedUserProgress)
def get_user_progress(
    search:    Optional[str] = Query(None),
    page:      int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_tasks = db.query(Content).count()
    q = db.query(User).filter(User.role == "user")
    if search:
        like = f"%{search}%"
        q = q.filter(
            (User.name.ilike(like)) | (User.username.ilike(like)) |
            (User.district.ilike(like)) | (User.constituency.ilike(like)) |
            (User.responsibility.ilike(like))
        )
    total = q.count()
    users = q.offset((page - 1) * page_size).limit(page_size).all()
    items = []
    for u in users:
        completed = db.query(UserTaskLog).filter(UserTaskLog.user_id == u.id).count()
        items.append(UserProgressItem(
            user_id=u.id, name=u.name, username=u.username,
            district=u.district or "", constituency=u.constituency or "",
            responsibility=u.responsibility or "",
            completed=completed, remaining=max(0, total_tasks - completed),
        ))
    return PaginatedUserProgress(
        items=items, total=total, page=page,
        page_size=page_size, total_pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return {
        "total_content":   db.query(Content).count(),
        "total_users":     db.query(User).filter(User.role == "user").count(),
        "total_actions":   db.query(UserTaskLog).count(),
        "x_posts":         db.query(Content).filter(Content.platform_type == "x_post").count(),
        "x_retweets":      db.query(Content).filter(Content.platform_type == "x_retweet").count(),
        "facebook_posts":  db.query(Content).filter(Content.platform_type == "facebook_post").count(),
    }
