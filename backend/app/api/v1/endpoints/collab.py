
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps

router = APIRouter()

@router.get("/awards", response_model=List[schemas.AwardCategory])
async def read_awards(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve award categories.
    """
    awards = await crud.award_category.get_multi(db, skip=skip, limit=limit)
    return awards

@router.post("/votes", response_model=schemas.Vote)
async def create_vote(
    *,
    db: AsyncSession = Depends(deps.get_db),
    vote_in: schemas.VoteCreate,
) -> Any:
    """
    Create a new vote. Voting must be open.
    """
    # Check if voting is open
    voting_status = await crud.voting_status.get_current_status(db)
    if not voting_status or not voting_status.is_voting_open:
        raise HTTPException(
            status_code=403,
            detail="Voting is currently closed"
        )
    
    vote = await crud.vote.create(db, obj_in=vote_in)
    return vote

@router.get("/votes/me", response_model=List[schemas.Vote])
async def read_my_votes(
    db: AsyncSession = Depends(deps.get_db),
    user_id: str = "u-1", # TODO: Get from current user
) -> Any:
    """
    Retrieve votes by current user.
    """
    votes = await crud.vote.get_by_nominator(db, nominator_id=user_id)
    return votes

@router.post("/feedback", response_model=schemas.Feedback)
async def create_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_in: schemas.FeedbackCreate,
) -> Any:
    """
    Create new feedback.
    """
    feedback = await crud.feedback.create(db, obj_in=feedback_in)
    return feedback

@router.get("/feedback/me", response_model=List[schemas.Feedback])
async def read_my_feedback(
    db: AsyncSession = Depends(deps.get_db),
    user_id: str = "u-1", # TODO: Get from current user
) -> Any:
    """
    Retrieve feedback received by current user.
    """
    feedback = await crud.feedback.get_by_receiver(db, user_id=user_id)
    return feedback

@router.post("/categories", response_model=schemas.AwardCategory)
async def create_award_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_in: schemas.AwardCategoryCreate,
) -> Any:
    """
    Create a new award category.
    """
    category = await crud.award_category.create(db, obj_in=category_in)
    return category
