import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

class Comment(Base):
    id: Mapped[str] = mapped_column(primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    post_id: Mapped[str] = mapped_column(ForeignKey("post.id", ondelete="CASCADE"), index=True, nullable=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("event.id", ondelete="CASCADE"), index=True, nullable=True)
    endorsement_id: Mapped[str] = mapped_column(ForeignKey("endorsements.id", ondelete="CASCADE"), index=True, nullable=True)
    content: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User")
    
    @property
    def user_name(self) -> str:
        return self.user.name if self.user else "Unknown"

    @property
    def user_avatar(self) -> str:
        return f"https://api.dicebear.com/7.x/adventurer/svg?seed={self.user_name}"

class Like(Base):
    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    post_id: Mapped[str] = mapped_column(ForeignKey("post.id", ondelete="CASCADE"), index=True, nullable=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("event.id", ondelete="CASCADE"), index=True, nullable=True)
    endorsement_id: Mapped[str] = mapped_column(ForeignKey("endorsements.id", ondelete="CASCADE"), index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'post_id', name='uq_user_post_like'),
        UniqueConstraint('user_id', 'event_id', name='uq_user_event_like'),
        UniqueConstraint('user_id', 'endorsement_id', name='uq_user_endorsement_like'),
    )
