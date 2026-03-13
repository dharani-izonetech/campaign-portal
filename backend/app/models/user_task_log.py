from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class UserTaskLog(Base):
    __tablename__ = "user_task_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="task_logs")
    content = relationship("Content", back_populates="task_logs")
