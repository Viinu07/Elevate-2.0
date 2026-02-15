
from datetime import datetime
from sqlalchemy import DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

class VotingStatus(Base):
    """Global voting status - single row table"""
    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    is_voting_open: Mapped[bool] = mapped_column(Boolean, default=False)
    results_visible: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)
    updated_by: Mapped[str] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    
    # Relationship
    admin_user: Mapped["User"] = relationship("User", foreign_keys=[updated_by])
