from sqlalchemy.orm import Session
from app.crud.v2 import task as crud_task
from app.schemas.v2 import task as schemas
from app.models.v2.task import Task
import uuid
from typing import Optional, List

async def create_task(db: Session, task_in: schemas.TaskCreate, creator_id: str) -> Task:
    task_data = task_in.model_dump()
    task_data["id"] = str(uuid.uuid4())
    task_data["created_by_id"] = creator_id
    
    # If no assignee, assign to creator? Or leave unassigned.
    # For now, generic logic:
    if not task_data.get("assigned_to_id"):
        task_data["assigned_to_id"] = creator_id

    db_obj = Task(**task_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

async def get_tasks(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    assigned_to_id: Optional[str] = None,
    linked_event_id: Optional[str] = None,
    linked_release_id: Optional[str] = None
) -> List[Task]:
    return await crud_task.task.get_multi_by_filter(
        db, 
        skip=skip, 
        limit=limit,
        assigned_to_id=assigned_to_id,
        linked_event_id=linked_event_id,
        linked_release_id=linked_release_id
    )

async def update_task(db: Session, task_id: str, task_in: schemas.TaskUpdate) -> Optional[Task]:
    db_obj = await crud_task.task.get(db, id=task_id)
    if not db_obj:
        return None
    return await crud_task.task.update(db, db_obj=db_obj, obj_in=task_in)

async def delete_task(db: Session, task_id: str) -> Optional[Task]:
     return await crud_task.task.remove(db, id=task_id)
