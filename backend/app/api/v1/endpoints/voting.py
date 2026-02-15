
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps

router = APIRouter()


@router.get("/status", response_model=schemas.VotingStatus)
async def get_voting_status(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get current voting status (open/closed).
    """
    status = await crud.voting_status.get_current_status(db)
    if not status:
        # Create default status if not exists
        status = await crud.voting_status.update_status(db, is_open=False)
    return status


@router.put("/status", response_model=schemas.VotingStatus)
async def update_voting_status(
    *,
    db: AsyncSession = Depends(deps.get_db),
    status_in: schemas.VotingStatusUpdate,
) -> Any:
    """
   Toggle voting status. (Admin only - add auth check in production)
    """
    status = await crud.voting_status.update_status(
        db,
        is_open=status_in.is_voting_open,
        results_visible=status_in.results_visible,
        updated_by=status_in.updated_by
    )
    return status


@router.get("/results")
async def get_all_results(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get top 3 results for all award categories.
    """
    results = await crud.vote.get_all_category_results(db)
    return results


@router.get("/results/{category_id}")
async def get_category_results(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_id: str,
) -> Any:
    """
    Get top 3 results for a specific category.
    """
    results = await crud.vote.get_category_results(db, category_id=category_id)
    return results
