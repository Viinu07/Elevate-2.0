
from typing import List
import uuid

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate


class CRUDEvent(CRUDBase[Event, EventCreate, EventUpdate]):
    async def get_all(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Event]:
        """Get all events ordered by date_time with organizer loaded"""
        result = await db.execute(
            select(Event)
            .options(selectinload(Event.organizer).selectinload(User.team))
            .order_by(desc(Event.date_time))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(
        self, db: AsyncSession, *, obj_in: EventCreate
    ) -> Event:
        """Create new event"""
        # Convert timezone-aware datetime to naive datetime if needed
        date_time = obj_in.date_time
        if date_time.tzinfo is not None:
            date_time = date_time.replace(tzinfo=None)
        
        db_obj = Event(
            id=str(uuid.uuid4()),
            name=obj_in.name,
            date_time=date_time,
            meeting_link=obj_in.meeting_link,
            organizer_id=obj_in.organizer_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Re-fetch with organizer relationship loaded
        result = await db.execute(
            select(Event)
            .options(selectinload(Event.organizer).selectinload(User.team))
            .filter(Event.id == db_obj.id)
        )
        return result.scalars().first()


event = CRUDEvent(Event)
