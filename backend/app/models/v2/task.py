from sqlalchemy import String, ForeignKey, DateTime, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid
import enum

class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class Task(Base):
    __tablename__ = "tasks"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, nullable=True)
    
    status: Mapped[TaskStatus] = mapped_column(String, default=TaskStatus.TODO)
    priority: Mapped[TaskPriority] = mapped_column(String, default=TaskPriority.MEDIUM)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Ownership
    assigned_to_id: Mapped[str] = mapped_column(ForeignKey("user.id"), nullable=True)
    created_by_id: Mapped[str] = mapped_column(ForeignKey("user.id"), nullable=True)
    
    # Linking
    linked_event_id: Mapped[str] = mapped_column(ForeignKey("event.id"), nullable=True)
    linked_release_id: Mapped[str] = mapped_column(ForeignKey("releases_v2.id"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    assigned_to: Mapped["User"] = relationship("User", foreign_keys=[assigned_to_id])
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    # event: Mapped["Event"] = relationship("Event")
    # release: Mapped["Release"] = relationship("Release")
