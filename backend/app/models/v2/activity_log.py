from sqlalchemy import String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid

class ActivityLog(Base):
    __tablename__ = "activity_log"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Who
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), index=True)
    
    # What
    action: Mapped[str] = mapped_column(String) # e.g., "created", "updated", "deleted", "endorsed"
    
    # Where (Entity)
    entity_type: Mapped[str] = mapped_column(String, index=True)
    entity_id: Mapped[str] = mapped_column(String, index=True)
    entity_name: Mapped[str] = mapped_column(String, nullable=True) # snapshot of name for display
    
    # Details
    details: Mapped[dict] = mapped_column(JSON, nullable=True) # Changed fields, diffs, etc.
    
    # When
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship("User")
