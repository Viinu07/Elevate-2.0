import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base
from typing import Optional, List

class Post(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    content: Mapped[str] = mapped_column(String, index=True)
    author_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    images: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    
    # Relationships
    author: Mapped["User"] = relationship("User", backref="posts")

    @property
    def author_name(self) -> str:
        return self.author.name if self.author else "Unknown"
    
    @property
    def author_role(self) -> str:
         return self.author.role if self.author else "Member"

    @property
    def author_team(self) -> str:
        return self.author.team_name if self.author else "General"
