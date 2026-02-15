from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/{team_id}/updates", response_model=List[schemas.TeamUpdateMessage])
async def read_team_updates(
    team_id: str,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve updates for a specific team.
    """
    updates = await crud.team_update.get_multi_by_team(
        db, team_id=team_id, skip=skip, limit=limit
    )
    return updates

@router.post("/{team_id}/updates", response_model=schemas.TeamUpdateMessage)
async def create_team_update(
    *,
    team_id: str,
    db: AsyncSession = Depends(deps.get_db),
    update_in: schemas.TeamUpdateCreateRequest,
    # In a real app, we would get current_user here. 
    # For now, we'll simulate it or require user_id in body if not simulating.
    # But wait, we don't have auth yet, so we have to cheat a bit.
    # We'll assume the frontend mimics a user or we pick the first user.
    # Let's start by picking the first user as "current user" for now.
) -> Any:
    """
    Create new team update.
    """
    # Simulate current user (temporary hack until true Auth)
    users = await crud.user.get_multi(db, limit=1)
    if not users:
        raise HTTPException(status_code=400, detail="No users exist to post update")
    current_user = users[0]

    update_create = schemas.TeamUpdateCreate(
        content=update_in.content,
        team_id=team_id,
        user_id=current_user.id
    )
    
    update = await crud.team_update.create(db, obj_in=update_create)
    return update
