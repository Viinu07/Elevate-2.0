from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid

class Endorsement(Base):
    __tablename__ = "endorsements"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Who linked
    giver_id: Mapped[str] = mapped_column(ForeignKey("user.id"), index=True)
    receiver_id: Mapped[str] = mapped_column(ForeignKey("user.id"), index=True)
    
    # Context
    category: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    project_id: Mapped[str] = mapped_column(String, nullable=True) # Mocked FK for now
    event_id: Mapped[str] = mapped_column(ForeignKey("event.id", ondelete="CASCADE"), index=True, nullable=True)
    skills: Mapped[str] = mapped_column(String, nullable=True) # JSON string or comma-separated
    
    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    giver: Mapped["User"] = relationship("User", foreign_keys=[giver_id])
    receiver: Mapped["User"] = relationship("User", foreign_keys=[receiver_id])
    event: Mapped["Event"] = relationship("Event")
