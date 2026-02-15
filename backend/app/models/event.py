
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

class Event(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    name: Mapped[str]
    date_time: Mapped[datetime] = mapped_column(DateTime)
    meeting_link: Mapped[str]
    organizer_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    event_type: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="UPCOMING")
    agenda: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # New fields for Enhanced Event Creation
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    timezone: Mapped[str] = mapped_column(String, default="UTC")
    
    # Awards Configuration
    has_awards: Mapped[bool] = mapped_column(Boolean, default=False)
    voting_required: Mapped[bool] = mapped_column(Boolean, default=False)
    award_categories: Mapped[str | None] = mapped_column(String, nullable=True) # JSON string or comma-separated

    # Relationships
    organizer: Mapped["User"] = relationship("User", foreign_keys=[organizer_id])
    participants: Mapped[list["EventParticipant"]] = relationship("EventParticipant", back_populates="event", cascade="all, delete-orphan") # Linked in V2 model
    endorsements: Mapped[list["Endorsement"]] = relationship("Endorsement", back_populates="event", cascade="all, delete-orphan") # Added to fix deletion constraint
    votes: Mapped[list["EventVote"]] = relationship("EventVote", back_populates="event", cascade="all, delete-orphan")

    
    @property
    def organizer_name(self) -> str:
        return self.organizer.name if self.organizer else "Unknown"
    
    @property
    def organizer_team(self) -> str | None:
        return self.organizer.team.name if self.organizer and self.organizer.team else None
