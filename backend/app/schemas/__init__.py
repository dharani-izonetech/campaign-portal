from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name:           str
    username:       str
    email:          str
    password:       str
    district:       Optional[str] = ""
    constituency:   Optional[str] = ""
    responsibility: Optional[str] = "Volunteer"   # free-text designation
    # NOTE: `role` (admin/user) is NOT exposed in the register form for security.
    # It defaults to "user". Set role=admin only via create_admin.py.
    role:           str = "user"


class UserLogin(BaseModel):
    identifier: str   # username OR email
    password:   str


class UserResponse(BaseModel):
    id:             int
    name:           str
    username:       str
    email:          str
    district:       Optional[str] = ""
    constituency:   Optional[str] = ""
    responsibility: Optional[str] = "Volunteer"
    role:           str
    created_at:     datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         UserResponse


# ─── Content ───────────────────────────────────────────────────────────────────

class ContentCreate(BaseModel):
    content:       str
    platform_type: str


class ContentResponse(BaseModel):
    id:            int
    content:       str
    platform_type: str
    created_at:    datetime

    class Config:
        from_attributes = True


class ContentWithStatus(BaseModel):
    id:            int
    content:       str
    platform_type: str
    created_at:    datetime
    completed:     bool = False

    class Config:
        from_attributes = True


# ─── Paginated wrappers ────────────────────────────────────────────────────────

class PaginatedContent(BaseModel):
    items:       List[ContentResponse]
    total:       int
    page:        int
    page_size:   int
    total_pages: int


class PaginatedContentWithStatus(BaseModel):
    items:       List[ContentWithStatus]
    total:       int
    page:        int
    page_size:   int
    total_pages: int


# ─── Progress ──────────────────────────────────────────────────────────────────

class UserProgressResponse(BaseModel):
    id:         int
    user_id:    int
    completed:  int
    remaining:  int
    updated_at: datetime

    class Config:
        from_attributes = True


class ContentProgressItem(BaseModel):
    content_id:      int
    content:         str
    platform_type:   str
    completed_users: int


class UserProgressItem(BaseModel):
    user_id:        int
    name:           str
    username:       str
    district:       Optional[str] = ""
    constituency:   Optional[str] = ""
    responsibility: Optional[str] = ""
    completed:      int
    remaining:      int


class PaginatedContentProgress(BaseModel):
    items:       List[ContentProgressItem]
    total:       int
    page:        int
    page_size:   int
    total_pages: int


class PaginatedUserProgress(BaseModel):
    items:       List[UserProgressItem]
    total:       int
    page:        int
    page_size:   int
    total_pages: int
