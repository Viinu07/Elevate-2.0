
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

# --- Team Endpoints ---

@router.get("/", response_model=List[schemas.Team])
async def read_teams(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve teams.
    """
    teams = await crud.team.get_multi(db, skip=skip, limit=limit)
    return teams

@router.post("/", response_model=schemas.Team)
async def create_team(
    *,
    db: AsyncSession = Depends(deps.get_db),
    team_in: schemas.TeamCreate,
) -> Any:
    """
    Create new team.
    """
    team = await crud.team.create(db, obj_in=team_in)
    # Re-fetch with eager loads
    team = await crud.team.get(db, id=team.id)
    return team

@router.put("/{team_id}", response_model=schemas.Team)
async def update_team(
    *,
    db: AsyncSession = Depends(deps.get_db),
    team_id: str,
    team_in: schemas.TeamUpdate,
) -> Any:
    """
    Update a team.
    """
    team = await crud.team.get(db, id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team = await crud.team.update(db, db_obj=team, obj_in=team_in)
    # Re-fetch with eager loads for response
    team = await crud.team.get(db, id=team_id)
    return team

@router.delete("/{team_id}", response_model=schemas.TeamInDBBase)
async def delete_team(
    *,
    db: AsyncSession = Depends(deps.get_db),
    team_id: str,
) -> Any:
    """
    Delete a team.
    """
    team = await crud.team.get(db, id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team = await crud.team.remove(db, id=team_id)
    return team

# --- ART Endpoints ---

@router.get("/arts/", response_model=List[schemas.ART])
async def read_arts(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve ARTs.
    """
    arts = await crud.art.get_multi(db, skip=skip, limit=limit)
    return arts

@router.post("/arts/", response_model=schemas.ART)
async def create_art(
    *,
    db: AsyncSession = Depends(deps.get_db),
    art_in: schemas.ARTCreate,
) -> Any:
    """
    Create new ART.
    """
    art = await crud.art.create(db, obj_in=art_in)
    # Explicitly set teams to empty list for Pydantic validation
    # This avoids the "LazyHandling" issue if we try to access .teams on a fresh object
    art.teams = [] 
    return art

@router.put("/arts/{art_id}", response_model=schemas.ART)
async def update_art(
    *,
    db: AsyncSession = Depends(deps.get_db),
    art_id: str,
    art_in: schemas.ARTUpdate,
) -> Any:
    """
    Update an ART.
    """
    art = await crud.art.get(db, id=art_id)
    if not art:
        raise HTTPException(status_code=404, detail="ART not found")
    art = await crud.art.update(db, db_obj=art, obj_in=art_in)
    # Re-fetch with eager loads
    art = await crud.art.get(db, id=art_id)
    return art

@router.delete("/arts/{art_id}", response_model=schemas.ARTInDBBase)
async def delete_art(
    *,
    db: AsyncSession = Depends(deps.get_db),
    art_id: str,
) -> Any:
    """
    Delete an ART.
    """
    art = await crud.art.get(db, id=art_id)
    if not art:
        raise HTTPException(status_code=404, detail="ART not found")
    art = await crud.art.remove(db, id=art_id)
    return art
