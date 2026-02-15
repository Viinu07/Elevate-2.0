from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud
from app.api import deps
from app.schemas.release import ReleaseWorkItem, ReleaseWorkItemCreate, ReleaseWorkItemUpdate

router = APIRouter()

@router.get("/", response_model=List[ReleaseWorkItem])
async def read_release_work_items(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve release work items.
    """
    work_items = await crud.release_work_item.get_multi(db, skip=skip, limit=limit)
    return work_items

@router.post("/", response_model=ReleaseWorkItem)
async def create_release_work_item(
    *,
    db: AsyncSession = Depends(deps.get_db),
    work_item_in: ReleaseWorkItemCreate,
) -> Any:
    """
    Create new release work item.
    """
    work_item = await crud.release_work_item.create(db=db, obj_in=work_item_in)
    return work_item

@router.put("/{id}", response_model=ReleaseWorkItem)
async def update_release_work_item(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    work_item_in: ReleaseWorkItemUpdate,
) -> Any:
    """
    Update a release work item.
    """
    work_item = await crud.release_work_item.get(db=db, id=id)
    if not work_item:
        raise HTTPException(status_code=404, detail="Work item not found")
    work_item = await crud.release_work_item.update(db=db, db_obj=work_item, obj_in=work_item_in)
    return work_item

@router.delete("/{id}", response_model=ReleaseWorkItem)
async def delete_release_work_item(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Delete a release work item.
    """
    work_item = await crud.release_work_item.get(db=db, id=id)
    if not work_item:
        raise HTTPException(status_code=404, detail="Work item not found")
    work_item = await crud.release_work_item.remove(db=db, id=id)
    return work_item
