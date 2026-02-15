from sqlalchemy import String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import enum

class RSVPStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    TENTATIVE = "TENTATIVE"

class EventParticipant(Base):
    __tablename__ = "event_participants"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True) # UUID
    event_id: Mapped[str] = mapped_column(ForeignKey("event.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    
    # RSVP
    rsvp_status: Mapped[RSVPStatus] = mapped_column(String, default=RSVPStatus.PENDING)
    rsvp_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Attendance
    attended: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # Relationships
    event: Mapped["Event"] = relationship("Event", back_populates="participants") # Backref handling
    user: Mapped["User"] = relationship("User")

    @property
    def user_name(self) -> str:
        return self.user.name if self.user else "Unknown"
