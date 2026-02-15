from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.v2.release import Release, ReleaseStatus
from app.models.v2.work_item import WorkItem, WorkItemStatus
from app.schemas.v2.release import ReleaseCreate, ReleaseUpdate, WorkItemCreate, WorkItemUpdate

class CRUDRelease(CRUDBase[Release, ReleaseCreate, ReleaseUpdate]):
    async def get_by_version(self, db: Session, version: str) -> Optional[Release]:
        stmt = select(Release).where(Release.version == version)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_status(self, db: Session, status: str) -> List[Release]:
        stmt = select(Release).where(Release.status == status)
        result = await db.execute(stmt)
        return result.scalars().all()

class CRUDWorkItem(CRUDBase[WorkItem, WorkItemCreate, WorkItemUpdate]):
    async def get_by_release(self, db: Session, release_id: str) -> List[WorkItem]:
        stmt = select(WorkItem).where(WorkItem.release_id == release_id)
        result = await db.execute(stmt)
        return result.scalars().all()
        
    async def get_by_assignee(self, db: Session, assignee_id: str) -> List[WorkItem]:
        stmt = select(WorkItem).where(WorkItem.assignee_id == assignee_id)
        result = await db.execute(stmt)
        return result.scalars().all()

release = CRUDRelease(Release)
work_item = CRUDWorkItem(WorkItem)
