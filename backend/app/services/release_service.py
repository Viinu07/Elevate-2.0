from sqlalchemy.orm import Session
from app.crud.v2 import release as crud_release
from app.schemas.v2 import release as schemas
from app.models.v2.release import Release
from app.models.v2.work_item import WorkItem
import uuid

async def create_release(db: Session, release_in: schemas.ReleaseCreate) -> Release:
    # Check if version exists
    existing = await crud_release.release.get_by_version(db, version=release_in.version)
    if existing:
        raise ValueError(f"Release version {release_in.version} already exists")
        
    release_data = release_in.model_dump()
    release_data["id"] = str(uuid.uuid4())
    
    db_obj = Release(**release_data)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    return db_obj

async def get_releases(db: Session, skip: int = 0, limit: int = 100) -> list[Release]:
    return await crud_release.release.get_multi(db, skip=skip, limit=limit)

async def get_release_details(db: Session, release_id: str) -> Release:
    release = await crud_release.release.get(db, id=release_id)
    if not release:
        return None
        
    # In a real app we'd load work items here or let Pydantic/Lazy loading handle it
    # For now, relying on simple CRUD
    return release

async def create_work_item(db: Session, work_item_in: schemas.WorkItemCreate) -> WorkItem:
    item_data = work_item_in.model_dump()
    item_data["id"] = str(uuid.uuid4())
    
    db_obj = WorkItem(**item_data)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    return db_obj

async def get_release_work_items(db: Session, release_id: str) -> list[WorkItem]:
    return await crud_release.work_item.get_by_release(db, release_id=release_id)
