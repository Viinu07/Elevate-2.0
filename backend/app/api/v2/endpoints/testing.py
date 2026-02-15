from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.api import deps
from app.schemas.v2 import testing as schemas
from app.services import testing_service
from app.models.user import User

router = APIRouter()

@router.post("/cycles", response_model=schemas.TestingCycleResponse, status_code=status.HTTP_201_CREATED)
async def create_cycle(
    cycle_in: schemas.TestingCycleCreate,
    db: Session = Depends(deps.get_db)
):
    return await testing_service.create_testing_cycle(db, cycle_in)

@router.get("/releases/{release_id}/cycles", response_model=List[schemas.TestingCycleResponse])
async def read_release_cycles(
    release_id: str,
    db: Session = Depends(deps.get_db)
):
    return await testing_service.get_release_cycles(db, release_id)

@router.post("/executions", response_model=schemas.TestExecutionResponse, status_code=status.HTTP_201_CREATED)
async def create_execution(
    execution_in: schemas.TestExecutionCreate,
    db: Session = Depends(deps.get_db),
    # current_user: User = Depends(deps.get_current_user)
):
    # Mock user
    current_user_id = "00000000-0000-0000-0000-000000000000"
    
    stmt = select(User)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        current_user_id = user.id
        
    return await testing_service.create_test_execution(db, execution_in, current_user_id)

@router.get("/cycles/{cycle_id}/executions", response_model=List[schemas.TestExecutionResponse])
async def read_cycle_executions(
    cycle_id: str,
    db: Session = Depends(deps.get_db)
):
    return await testing_service.get_cycle_executions(db, cycle_id)
