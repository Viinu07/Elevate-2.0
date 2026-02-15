from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app.api import deps
from app.schemas.v2 import task as schemas
from app.services import task_service
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(deps.get_db)
):
    # Mock user
    current_user_id = "00000000-0000-0000-0000-000000000000"
    
    stmt = select(User)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        current_user_id = user.id
        
    return await task_service.create_task(db, task_in, current_user_id)

@router.get("/", response_model=List[schemas.TaskResponse])
async def read_tasks(
    skip: int = 0,
    limit: int = 100,
    assigned_to_id: Optional[str] = None,
    linked_event_id: Optional[str] = None,
    linked_release_id: Optional[str] = None,
    db: Session = Depends(deps.get_db)
):
    return await task_service.get_tasks(
        db, 
        skip=skip, 
        limit=limit, 
        assigned_to_id=assigned_to_id, 
        linked_event_id=linked_event_id, 
        linked_release_id=linked_release_id
    )

@router.put("/{task_id}", response_model=schemas.TaskResponse)
async def update_task(
    task_id: str,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(deps.get_db)
):
    task = await task_service.update_task(db, task_id, task_in)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}", response_model=schemas.TaskResponse)
async def delete_task(
    task_id: str,
    db: Session = Depends(deps.get_db)
):
    task = await task_service.delete_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
