from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.v2.task import Task
from app.schemas.v2.task import TaskCreate, TaskUpdate

class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    async def get_multi_by_filter(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        assigned_to_id: Optional[str] = None,
        linked_event_id: Optional[str] = None,
        linked_release_id: Optional[str] = None
    ) -> List[Task]:
        stmt = select(self.model)
        if assigned_to_id:
            stmt = stmt.where(self.model.assigned_to_id == assigned_to_id)
        if linked_event_id:
            stmt = stmt.where(self.model.linked_event_id == linked_event_id)
        if linked_release_id:
            stmt = stmt.where(self.model.linked_release_id == linked_release_id)
        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

task = CRUDTask(Task)
