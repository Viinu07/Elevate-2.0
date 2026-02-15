
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps

router = APIRouter()


@router.get("/received", response_model=List[schemas.Feedback])
async def get_received_feedback(
    db: AsyncSession = Depends(deps.get_db),
    user_id: str = Query(..., description="User ID to get received feedback for"),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get feedback received by a specific user.
    """
    feedbacks = await crud.feedback.get_received(db, user_id=user_id, skip=skip, limit=limit)
    return feedbacks


@router.get("/sent", response_model=List[schemas.Feedback])
async def get_sent_feedback(
    db: AsyncSession = Depends(deps.get_db),
    user_id: str = Query(..., description="User ID to get sent feedback for"),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get feedback sent by a specific user.
    """
    feedbacks = await crud.feedback.get_sent(db, user_id=user_id, skip=skip, limit=limit)
    return feedbacks


@router.post("/", response_model=schemas.Feedback)
async def create_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_in: schemas.FeedbackCreate,
) -> Any:
    """
    Create new feedback. Both from_user_id and to_user_id are provided in the request body.
    """
    feedback = await crud.feedback.create(db, obj_in=feedback_in)
    return feedback


@router.patch("/{feedback_id}/reaction", response_model=schemas.Feedback)
async def update_feedback_reaction(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: str,
    reaction: str = Query(None, description="Reaction type: helpful, appreciate, insightful, acknowledged, or null to remove"),
) -> Any:
    """
    Update reaction for a feedback item. Only one reaction allowed at a time.
    Set reaction to empty string or null to remove the reaction.
    """
    # Use explicit select to load relationships eagerly
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.feedback import Feedback
    
    query = select(Feedback).where(Feedback.id == feedback_id).options(
        selectinload(Feedback.from_user),
        selectinload(Feedback.to_user)
    )
    result = await db.execute(query)
    feedback = result.scalar_one_or_none()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Update reaction (null/empty string removes it)
    feedback.reaction = reaction if reaction and reaction.strip() else None
    await db.commit()
    
    # Re-fetch deeply to ensure relationships are loaded (commit expires attributes)
    result = await db.execute(query)
    feedback = result.scalar_one()
    return feedback


@router.patch("/{feedback_id}/reply", response_model=schemas.Feedback)
async def update_feedback_reply(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: str,
    reply: str = Query(..., description="Reply content or action plan"),
) -> Any:
    """
    Update reply/action plan for a feedback item.
    """
    # Use explicit select to load relationships eagerly
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.feedback import Feedback
    
    query = select(Feedback).where(Feedback.id == feedback_id).options(
        selectinload(Feedback.from_user),
        selectinload(Feedback.to_user)
    )
    result = await db.execute(query)
    feedback = result.scalar_one_or_none()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.reply = reply
    await db.commit()
    
    # Re-fetch deeply to ensure relationships are loaded
    result = await db.execute(query)
    feedback = result.scalar_one()
    
    return feedback

