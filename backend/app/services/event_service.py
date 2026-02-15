from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.crud.v2 import event as crud_event
from app.models.event import Event
from app.schemas.v2 import event as schemas
from app.models.v2.event_participant import EventParticipant
from app.models.v2.endorsement import Endorsement
from datetime import datetime
import uuid

async def create_event(db: AsyncSession, event_in: schemas.EventCreate, current_user_id: str) -> Event:
    event_data = event_in.model_dump()
    event_data["id"] = str(uuid.uuid4())
    # Use provided organizer_id if set, otherwise fallback to current_user_id
    if not event_data.get("organizer_id"):
        event_data["organizer_id"] = current_user_id
    
    # Fix for asyncpg DataError: can't subtract offset-naive and offset-aware datetimes
    if event_data.get("date_time") and event_data["date_time"].tzinfo:
        event_data["date_time"] = event_data["date_time"].replace(tzinfo=None)
    if event_data.get("end_time") and event_data["end_time"].tzinfo:
        event_data["end_time"] = event_data["end_time"].replace(tzinfo=None)

    # Create DB object
    db_event = Event(**event_data)
    db.add(db_event)
    await db.commit()
    
    # Auto-add organizer as participant
    participant = EventParticipant(
        id=str(uuid.uuid4()),
        event_id=db_event.id,
        user_id=current_user_id,
        rsvp_status="ACCEPTED",
        attended=True
    )
    db.add(participant)
    await db.commit()
    
    # Reload event with organizer for Pydantic serialization properties (organizer_name)
    stmt = select(Event).options(selectinload(Event.organizer)).where(Event.id == db_event.id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_event_with_relations(db: AsyncSession, event_id: str):
    # Eager load organizer and endorsements with their givers
    stmt = select(Event).options(
        selectinload(Event.organizer),
        selectinload(Event.endorsements).selectinload(Endorsement.giver)
    ).where(Event.id == event_id)
    result = await db.execute(stmt)
    event = result.scalars().first()
    
    if not event:
        return None
        
    # Manually fetch participants with user data
    participants_models = await crud_event.event.get_participants(db, event_id=event_id)
    
    # Manually construct ParticipantResponse objects to avoid lazy loading
    participants = []
    for p in participants_models:
        participants.append(schemas.ParticipantResponse(
            id=p.id,
            user_id=p.user_id,
            user_name=p.user.name if p.user else "Unknown",
            rsvp_status=p.rsvp_status,
            attended=p.attended
        ))

    # Map endorsements
    endorsements = []
    if event.endorsements:
        for e in event.endorsements:
            endorsements.append(schemas.EndorsementSummary(
                id=e.id,
                category=e.category,
                giver_name=e.giver.name if e.giver else "Unknown",
                created_at=e.created_at
            ))
    
    # Return a properly constructed EventDetailResponse dict to avoid accessing model properties
    return schemas.EventDetailResponse(
        id=event.id,
        name=event.name,
        date_time=event.date_time,
        meeting_link=event.meeting_link,
        event_type=event.event_type,
        status=event.status,
        agenda=event.agenda,
        organizer_id=event.organizer_id,
        organizer_name=event.organizer.name if event.organizer else "Unknown",  # Manually extract
        created_at=event.created_at,
        participants=participants,
        endorsements=endorsements,
        end_time=event.end_time,
        timezone=event.timezone,
        has_awards=event.has_awards,
        voting_required=event.voting_required,
        award_categories=event.award_categories
    )


async def add_participant(db: AsyncSession, event_id: str, participant_in: schemas.ParticipantCreate):
    return await crud_event.event.create_participant(db, participant_in, event_id)

async def change_status(db: AsyncSession, event_id: str, status_update: schemas.EventStatusUpdate):
    event = await crud_event.event.get(db, id=event_id)
    if not event:
        return None
        
    event.status = status_update.status
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

async def link_release(db: AsyncSession, event_id: str, link_data: schemas.EventReleaseLink):
    # This involves EntityReference. For MVP, we might skip implementation
    pass

async def get_event(db: AsyncSession, event_id: str) -> Event | None:
    result = await db.execute(select(Event).where(Event.id == event_id))
    return result.scalars().first()

async def delete_event(db: AsyncSession, event_id: str):
    event = await get_event(db, event_id)
    if event:
        await db.delete(event)
        await db.commit()
