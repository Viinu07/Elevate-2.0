import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

class TeamUpdate(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    team_id: Mapped[str] = mapped_column(ForeignKey("team.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    
    # Relationships
    team: Mapped["Team"] = relationship("Team", backref="updates")
    user: Mapped["User"] = relationship("User", backref="posted_updates")

    @property
    def user_name(self) -> str:
        return self.user.name if self.user else "Unknown User"
