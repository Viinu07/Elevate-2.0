from typing import List, Union, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.release import ReleaseWorkItem
from app.schemas.release import ReleaseWorkItemCreate, ReleaseWorkItemUpdate

class CRUDReleaseWorkItem(CRUDBase[ReleaseWorkItem, ReleaseWorkItemCreate, ReleaseWorkItemUpdate]):
    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ReleaseWorkItem,
        obj_in: Union[ReleaseWorkItemUpdate, Dict[str, Any]]
    ) -> ReleaseWorkItem:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        if update_data.get("status") == "Completed" and db_obj.status != "Completed":
            if "completed_at" not in update_data or not update_data["completed_at"]:
                update_data["completed_at"] = datetime.utcnow().isoformat()
            update_data["is_completed"] = True
        
        return await super().update(db, db_obj=db_obj, obj_in=update_data)

release_work_item = CRUDReleaseWorkItem(ReleaseWorkItem)
