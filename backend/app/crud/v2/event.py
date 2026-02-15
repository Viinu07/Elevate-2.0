from typing import List, Optional, Union, Dict, Any
import uuid
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.event import Event
from app.models.user import User
from app.models.v2.event_participant import EventParticipant, RSVPStatus
from app.schemas.v2.event import EventCreate, EventUpdate, ParticipantCreate

class CRUDEvent(CRUDBase[Event, EventCreate, EventUpdate]):
    async def get_with_relations(self, db: Session, id: Any) -> Optional[Event]:
        # Simple get for now, relationships loaded via lazy loading or explicit join if needed
        # In async SQLAlchemy usually we need explicit selects with selectinload options
        # But for this sync-style session (checking imports), it might be standard generic
        # If the project uses asyncpg (which it does based on config), we need await db.execute
        # Let's assume standard sync session for now matching CRUD base or adjust if it's async
        stmt = select(Event).where(Event.id == id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create_participant(self, db: Session, obj_in: ParticipantCreate, event_id: str) -> EventParticipant:
        # Check if participant already exists
        stmt = select(EventParticipant).where(
            EventParticipant.event_id == event_id,
            EventParticipant.user_id == obj_in.user_id
        )
        result = await db.execute(stmt)
        existing_participant = result.scalars().first()

        if existing_participant:
            # Update
            existing_participant.rsvp_status = obj_in.rsvp_status
            db.add(existing_participant)
            await db.commit()
            
            # Refresh with user relationship loaded
            stmt = select(EventParticipant).options(joinedload(EventParticipant.user)).where(EventParticipant.id == existing_participant.id)
            result = await db.execute(stmt)
            return result.scalars().first()
        else:
            # Create
            db_obj = EventParticipant(
                id=str(uuid.uuid4()),
                event_id=event_id,
                user_id=obj_in.user_id,
                rsvp_status=obj_in.rsvp_status
            )
            db.add(db_obj)
            await db.commit()
            
            # Refresh with user relationship loaded
            stmt = select(EventParticipant).options(joinedload(EventParticipant.user)).where(EventParticipant.id == db_obj.id)
            result = await db.execute(stmt)
            return result.scalars().first()

    async def get_participants(self, db: Session, event_id: str) -> List[EventParticipant]:
        stmt = select(EventParticipant).options(joinedload(EventParticipant.user)).where(EventParticipant.event_id == event_id)
        result = await db.execute(stmt)
        return result.scalars().all()

event = CRUDEvent(Event)
