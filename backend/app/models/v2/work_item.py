from sqlalchemy import String, ForeignKey, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid
import enum

class WorkItemType(str, enum.Enum):
    FEATURE = "FEATURE"
    BUG = "BUG"
    TASK = "TASK"
    IMPROVEMENT = "IMPROVEMENT"

class WorkItemStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    TESTING = "TESTING"
    DONE = "DONE"

class WorkItem(Base):
    __tablename__ = "work_items_v2"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Links
    release_id: Mapped[str] = mapped_column(ForeignKey("releases_v2.id"), index=True, nullable=True)
    assignee_id: Mapped[str] = mapped_column(ForeignKey("user.id"), index=True, nullable=True)
    team_id: Mapped[str] = mapped_column(ForeignKey("team.id"), index=True, nullable=True)
    
    # Content
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, nullable=True)
    type: Mapped[WorkItemType] = mapped_column(String, default=WorkItemType.FEATURE)
    status: Mapped[WorkItemStatus] = mapped_column(String, default=WorkItemStatus.TODO)
    priority: Mapped[str] = mapped_column(String, default="Medium") # Low, Medium, High, Critical
    
    # Metadata
    story_points: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    release: Mapped["Release"] = relationship("Release") # back_populates="work_items"
    assignee: Mapped["User"] = relationship("User")
    team: Mapped["Team"] = relationship("Team")
