
import uuid
from typing import Optional
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

class User(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(index=True)
    role: Mapped[Optional[str]] = mapped_column(nullable=True)
    # email, hashed_password, avatar_url removed per user request
    team_id: Mapped[Optional[str]] = mapped_column(ForeignKey("team.id"), index=True, nullable=True)
    
    # Relationships
    team: Mapped[Optional["Team"]] = relationship("Team", back_populates="members")

    @property
    def team_name(self) -> Optional[str]:
        return self.team.name if self.team else None

    @property
    def art_id(self) -> Optional[str]:
        return self.team.art_id if self.team else None

    @property
    def art_name(self) -> Optional[str]:
        return self.team.art.name if self.team and self.team.art else None
