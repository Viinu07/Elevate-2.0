from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid

class EntityReference(Base):
    __tablename__ = "entity_reference"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Source Entity
    source_entity_type: Mapped[str] = mapped_column(String, index=True) # e.g., "event", "release", "task"
    source_entity_id: Mapped[str] = mapped_column(String, index=True)
    
    # Target Entity
    target_entity_type: Mapped[str] = mapped_column(String, index=True) # e.g., "release", "work_item"
    target_entity_id: Mapped[str] = mapped_column(String, index=True)
    
    # Metadata
    relationship_type: Mapped[str] = mapped_column(String, nullable=True) # e.g., "blocks", "relates_to"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by_id: Mapped[str] = mapped_column(ForeignKey("user.id"), nullable=True)
    
    # We can't easily set up relationships to every possible entity type here,
    # so we'll rely on the application layer or specific helper methods to fetch objects.
