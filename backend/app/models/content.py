from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    platform_type = Column(String, nullable=False)  # x_post, x_retweet, facebook_post
    created_at = Column(DateTime, default=datetime.utcnow)

    task_logs = relationship("UserTaskLog", back_populates="content")
