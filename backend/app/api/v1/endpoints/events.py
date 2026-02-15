
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Event])
async def get_events(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all events.
    """
    events = await crud.event.get_all(db, skip=skip, limit=limit)
    return events


@router.post("/", response_model=schemas.Event)
async def create_event(
    *,
    db: AsyncSession = Depends(deps.get_db),
    event_in: schemas.EventCreate,
) -> Any:
    """
    Create new event.
    """
    event = await crud.event.create(db, obj_in=event_in)
    return event


@router.delete("/{event_id}", response_model=schemas.Event)
async def delete_event(
    *,
    db: AsyncSession = Depends(deps.get_db),
    event_id: str,
) -> Any:
    """
    Delete an event.
    """
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.event import Event
    from app.models.user import User
    
    # Get event with organizer loaded
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.organizer).selectinload(User.team))
        .filter(Event.id == event_id)
    )
    event = result.scalars().first()
    
    if not event:
        raise HTTPException(
            status_code=404,
            detail="The event with this id does not exist in the system",
        )
    
    await db.delete(event)
    await db.commit()
    return event
