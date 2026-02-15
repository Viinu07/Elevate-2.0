from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from typing import List, Any
from app.api import deps
from app.schemas.v2 import event as event_schemas
from app.services import event_service
from app.models.user import User
from app.models.event import Event

router = APIRouter()

@router.post("/", response_model=event_schemas.EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: event_schemas.EventCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return await event_service.create_event(db, event_in, current_user.id)

@router.get("/", response_model=Any)
async def list_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """List all events with social stats"""
    from sqlalchemy.orm import selectinload
    from sqlalchemy import func, and_
    from app.models.social import Like, Comment

    # 1. Fetch Events
    stmt = (
        select(Event)
        .options(selectinload(Event.organizer))
        .offset(skip)
        .limit(limit)
        .order_by(Event.date_time.desc())
    )
    result = await db.execute(stmt)
    events = result.scalars().all()

    if not events:
        return []

    event_ids = [e.id for e in events]

    # 2. Fetch Like Counts
    stmt_likes = (
        select(Like.event_id, func.count(Like.id))
        .where(Like.event_id.in_(event_ids))
        .group_by(Like.event_id)
    )
    result_likes = await db.execute(stmt_likes)
    like_counts = {row[0]: row[1] for row in result_likes.all()}

    # 3. Fetch Comment Counts
    stmt_comments = (
        select(Comment.event_id, func.count(Comment.id))
        .where(Comment.event_id.in_(event_ids))
        .group_by(Comment.event_id)
    )
    result_comments = await db.execute(stmt_comments)
    comment_counts = {row[0]: row[1] for row in result_comments.all()}

    # 4. Fetch User Likes
    stmt_user_likes = (
        select(Like.event_id)
        .where(and_(Like.event_id.in_(event_ids), Like.user_id == current_user.id))
    )
    result_user_likes = await db.execute(stmt_user_likes)
    user_liked_event_ids = set(result_user_likes.scalars().all())

    # 5. Assemble Response
    # We return a dict list to include extra fields not in the Pydantic model yet, or we need to update the model.
    # For now, let's return a modified dict effectively.
    response = []
    for event in events:
        event_dict = event_schemas.EventResponse.model_validate(event).model_dump()
        event_dict['likes'] = like_counts.get(event.id, 0)
        event_dict['comments'] = comment_counts.get(event.id, 0)
        event_dict['liked_by_user'] = event.id in user_liked_event_ids
        response.append(event_dict)

    return response

@router.get("/{event_id}", response_model=event_schemas.EventDetailResponse)
async def get_event(
    event_id: str,
    db: Session = Depends(deps.get_db)
):
    event = await event_service.get_event_with_relations(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/{event_id}/participants", response_model=event_schemas.ParticipantResponse)
async def add_participant(
    event_id: str,
    participant_in: event_schemas.ParticipantCreate,
    db: Session = Depends(deps.get_db)
):
    return await event_service.add_participant(db, event_id, participant_in)

@router.patch("/{event_id}/status", response_model=event_schemas.EventResponse)
async def change_status(
    event_id: str,
    status_update: event_schemas.EventStatusUpdate,
    db: Session = Depends(deps.get_db)
):
    event = await event_service.change_status(db, event_id, status_update)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Delete an event (Organizer only)"""
    event = await event_service.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
    await event_service.delete_event(db, event_id)
    return None

# Social Interactions
from app.models.social import Like, Comment
from app.schemas.v2.post import CommentCreate, CommentResponse # Reuse schemas
from sqlalchemy import and_

@router.post("/{event_id}/like", response_model=bool)
async def like_event(
    event_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    stmt = select(Like).where(
        and_(Like.user_id == current_user.id, Like.event_id == event_id)
    )
    result = await db.execute(stmt)
    existing_like = result.scalars().first()

    if existing_like:
        await db.delete(existing_like)
        await db.commit()
        return False
    else:
        new_like = Like(user_id=current_user.id, event_id=event_id)
        db.add(new_like)
        await db.commit()
        return True

@router.get("/{event_id}/likes", response_model=List[Any])
async def get_event_likes(
    event_id: str,
    db: Session = Depends(deps.get_db),
):
    stmt = (
        select(User)
        .join(Like, Like.user_id == User.id)
        .where(Like.event_id == event_id)
        .limit(10)
    )
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [{"id": u.id, "name": u.name, "avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={u.name}"} for u in users]

@router.post("/{event_id}/comments", response_model=CommentResponse)
async def create_event_comment(
    event_id: str,
    comment_in: CommentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    comment = Comment(
        content=comment_in.content,
        event_id=event_id,
        user_id=current_user.id
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    
    # Eager load user
    from sqlalchemy.orm import selectinload
    stmt = select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.get("/{event_id}/comments", response_model=List[CommentResponse])
async def get_event_comments(
    event_id: str,
    db: Session = Depends(deps.get_db),
):
    stmt = (
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.event_id == event_id)
        .order_by(Comment.created_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()
