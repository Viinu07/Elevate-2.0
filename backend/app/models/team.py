
import uuid
from typing import List, Optional
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

class ART(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(unique=True, index=True)
    
    # Relationships
    teams: Mapped[List["Team"]] = relationship(back_populates="art", cascade="all, delete-orphan")

class Team(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(index=True)
    art_id: Mapped[str] = mapped_column(ForeignKey("art.id"))
    
    # Relationships
    art: Mapped["ART"] = relationship(back_populates="teams")
    members: Mapped[List["User"]] = relationship("User", back_populates="team")

    @property
    def art_name(self) -> str:
        return self.art.name if self.art else None
