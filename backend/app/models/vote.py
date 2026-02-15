from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

class EventVote(Base):
    __tablename__ = "event_vote"
    
    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("event.id", ondelete="CASCADE"), index=True)
    voter_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    nominee_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    
    award_category: Mapped[str] = mapped_column(String, index=True)
    reason: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    event: Mapped["Event"] = relationship("Event", back_populates="votes")
    voter: Mapped["User"] = relationship("User", foreign_keys=[voter_id])
    nominee: Mapped["User"] = relationship("User", foreign_keys=[nominee_id])
