from sqlalchemy import String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid
import enum

class NotificationType(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    SUCCESS = "SUCCESS"
    MENTION = "MENTION"
    ASSIGNMENT = "ASSIGNMENT"

class NotificationChannel(str, enum.Enum):
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"

class Notification(Base):
    __tablename__ = "notifications"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), index=True)
    
    title: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(String)
    type: Mapped[NotificationType] = mapped_column(String, default=NotificationType.INFO)
    
    related_entity_type: Mapped[str] = mapped_column(String, nullable=True) # e.g. "task", "release"
    related_entity_id: Mapped[str] = mapped_column(String, nullable=True)
    
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # recipient: Mapped["User"] = relationship("User")

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), index=True)
    
    notification_type: Mapped[NotificationType] = mapped_column(String)
    channel: Mapped[NotificationChannel] = mapped_column(String)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
