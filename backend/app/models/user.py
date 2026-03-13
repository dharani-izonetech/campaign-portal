from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class User(Base):
    __tablename__ = "users"
    # schema is inherited from Base.metadata.schema (set in database.py)

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String, nullable=False)
    username       = Column(String, nullable=False, unique=True, index=True)
    email          = Column(String, nullable=False, unique=True, index=True)
    password       = Column(String, nullable=False)
    district       = Column(String, nullable=True, default="")
    constituency   = Column(String, nullable=True, default="")
    responsibility = Column(String, nullable=True, default="Volunteer")  # free-text designation
    role           = Column(String, default="user")   # system role: "admin" | "user"
    created_at     = Column(DateTime, default=datetime.utcnow)

    progress  = relationship("UserProgress", back_populates="user", uselist=False)
    task_logs = relationship("UserTaskLog",  back_populates="user")
