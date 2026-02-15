from sqlalchemy import String, ForeignKey, DateTime, Enum, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid
import enum

class ReleaseStatus(str, enum.Enum):
    PLANNING = "PLANNING"
    DEVELOPMENT = "DEVELOPMENT"
    TESTING = "TESTING"
    STAGING = "STAGING"
    PRODUCTION = "PRODUCTION"
    COMPLETED = "COMPLETED"

class Release(Base):
    __tablename__ = "releases_v2"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    version: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=True) # e.g. "Q1 Release"
    
    status: Mapped[ReleaseStatus] = mapped_column(String, default=ReleaseStatus.PLANNING)
    
    # Dates
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    release_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    actual_release_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Metrics (Computed or cached)
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    health_score: Mapped[int] = mapped_column(Integer, default=100)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    # work_items: Mapped[list["WorkItem"]] = relationship("WorkItem", back_populates="release")
