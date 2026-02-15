

from datetime import datetime
from typing import Optional
from sqlalchemy import ForeignKey, DateTime, String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base
import uuid

class Feedback(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    from_user_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    to_user_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    content: Mapped[str]
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    reaction: Mapped[Optional[str]] = mapped_column(nullable=True)  # helpful, appreciate, insightful, acknowledged
    reply: Mapped[Optional[str]] = mapped_column(nullable=True)  # Action plan or response
    
    # Relationships
    from_user: Mapped["User"] = relationship("User", foreign_keys=[from_user_id])
    to_user: Mapped["User"] = relationship("User", foreign_keys=[to_user_id])
    
    @property
    def from_user_name(self) -> str:
        return self.from_user.name if self.from_user else "Unknown"
    
    @property
    def to_user_name(self) -> str:
        return self.to_user.name if self.to_user else "Unknown"


class AwardCategory(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str]
    icon: Mapped[str]
    description: Mapped[str]

class Vote(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    award_category_id: Mapped[str] = mapped_column(ForeignKey("awardcategory.id", ondelete="CASCADE"))
    nominator_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    nominee_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    reason: Mapped[Optional[str]]
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    category: Mapped["AwardCategory"] = relationship("AwardCategory", foreign_keys=[award_category_id])
    nominator: Mapped["User"] = relationship("User", foreign_keys=[nominator_id])
    nominee: Mapped["User"] = relationship("User", foreign_keys=[nominee_id])
    
    @property
    def nominee_name(self) -> str:
        return self.nominee.name if self.nominee else "Unknown"
