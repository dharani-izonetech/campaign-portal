from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.user_progress import UserProgress
from ..models.content import Content
from ..schemas import UserRegister, UserLogin, Token, UserResponse
from ..services.auth_service import (
    hash_password, verify_password, create_access_token,
    get_user_by_username, get_user_by_email, get_user_by_identifier,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name           = user_data.name,
        username       = user_data.username,
        email          = user_data.email,
        password       = hash_password(user_data.password),
        district       = user_data.district       or "",
        constituency   = user_data.constituency   or "",
        responsibility = user_data.responsibility or "Volunteer",
        role           = user_data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    total_tasks = db.query(Content).count()
    db.add(UserProgress(user_id=user.id, completed=0, remaining=total_tasks))
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_identifier(db, login_data.identifier)
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}
