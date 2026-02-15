from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.api import deps
from app.schemas.v2 import release as schemas
from app.services import release_service

router = APIRouter()

@router.post("/", response_model=schemas.ReleaseResponse, status_code=status.HTTP_201_CREATED)
async def create_release(
    release_in: schemas.ReleaseCreate,
    db: Session = Depends(deps.get_db)
):
    try:
        return await release_service.create_release(db, release_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.ReleaseResponse])
async def read_releases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    return await release_service.get_releases(db, skip=skip, limit=limit)

@router.get("/{release_id}", response_model=schemas.ReleaseDetailResponse)
async def read_release(
    release_id: str,
    db: Session = Depends(deps.get_db)
):
    release = await release_service.get_release_details(db, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    return release

@router.post("/{release_id}/work-items", response_model=schemas.WorkItemResponse)
async def create_work_item(
    release_id: str,
    work_item_in: schemas.WorkItemCreate,
    db: Session = Depends(deps.get_db)
):
    # Ensure release exists
    release = await release_service.get_release_details(db, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
        
    # Force release_id
    work_item_in.release_id = release_id
    return await release_service.create_work_item(db, work_item_in)

@router.get("/{release_id}/work-items", response_model=List[schemas.WorkItemResponse])
async def read_release_work_items(
    release_id: str,
    db: Session = Depends(deps.get_db)
):
    return await release_service.get_release_work_items(db, release_id)
