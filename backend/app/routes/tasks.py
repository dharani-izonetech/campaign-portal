from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import math

from ..database import get_db
from ..models.content import Content
from ..models.user import User
from ..models.user_progress import UserProgress
from ..models.user_task_log import UserTaskLog
from ..schemas import ContentWithStatus, PaginatedContentWithStatus
from ..services.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

VALID_PLATFORMS = ["x_post", "x_retweet", "facebook_post"]

@router.get("/", response_model=PaginatedContentWithStatus)
def get_tasks(
    platform: Optional[str] = Query(None, description="Filter: x_post, x_retweet, facebook_post"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Content)
    if platform and platform in VALID_PLATFORMS:
        query = query.filter(Content.platform_type == platform)
    query = query.order_by(Content.created_at.desc())

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    completed_ids = {
        log.content_id for log in
        db.query(UserTaskLog).filter(UserTaskLog.user_id == current_user.id).all()
    }

    return PaginatedContentWithStatus(
        items=[
            ContentWithStatus(
                id=c.id, content=c.content, platform_type=c.platform_type,
                created_at=c.created_at, completed=c.id in completed_ids
            ) for c in items
        ],
        total=total, page=page, page_size=page_size, total_pages=total_pages
    )

# Keep legacy endpoints for backward compat
@router.get("/x-posts")
def get_x_posts(
    page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return _get_by_platform("x_post", page, page_size, current_user, db)

@router.get("/x-retweets")
def get_x_retweets(
    page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return _get_by_platform("x_retweet", page, page_size, current_user, db)

@router.get("/facebook-posts")
def get_facebook_posts(
    page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return _get_by_platform("facebook_post", page, page_size, current_user, db)

def _get_by_platform(platform, page, page_size, user, db):
    query = db.query(Content).filter(Content.platform_type == platform).order_by(Content.created_at.desc())
    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    completed_ids = {
        log.content_id for log in db.query(UserTaskLog).filter(UserTaskLog.user_id == user.id).all()
    }
    return PaginatedContentWithStatus(
        items=[ContentWithStatus(
            id=c.id, content=c.content, platform_type=c.platform_type,
            created_at=c.created_at, completed=c.id in completed_ids
        ) for c in items],
        total=total, page=page, page_size=page_size, total_pages=total_pages
    )

@router.post("/complete/{content_id}")
def complete_task(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    existing = db.query(UserTaskLog).filter(
        UserTaskLog.user_id == current_user.id,
        UserTaskLog.content_id == content_id
    ).first()
    if existing:
        return {"message": "Already completed", "already_done": True}

    log = UserTaskLog(user_id=current_user.id, content_id=content_id, completed_at=datetime.utcnow())
    db.add(log)

    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()
    if progress:
        progress.completed += 1
        progress.remaining = max(0, progress.remaining - 1)
        progress.updated_at = datetime.utcnow()
    else:
        total = db.query(Content).count()
        progress = UserProgress(user_id=current_user.id, completed=1, remaining=max(0, total - 1))
        db.add(progress)

    db.commit()
    return {"message": "Task completed", "already_done": False}

@router.get("/my-progress")
def get_my_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_tasks = db.query(Content).count()
    completed = db.query(UserTaskLog).filter(UserTaskLog.user_id == current_user.id).count()
    remaining = max(0, total_tasks - completed)
    x_post_count = db.query(Content).filter(Content.platform_type == "x_post").count()
    x_retweet_count = db.query(Content).filter(Content.platform_type == "x_retweet").count()
    fb_count = db.query(Content).filter(Content.platform_type == "facebook_post").count()
    return {
        "completed": completed, "remaining": remaining, "total": total_tasks,
        "x_post_count": x_post_count, "x_retweet_count": x_retweet_count, "facebook_count": fb_count
    }
