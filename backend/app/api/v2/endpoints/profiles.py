from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import select
from app.api import deps
from app.schemas.v2 import profile as schemas
from app.services import profile_service
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=schemas.UserProfileFullResponse)
async def read_my_profile(
    db: Session = Depends(deps.get_db)
):
    # Mock user
    current_user_id = "00000000-0000-0000-0000-000000000000"
    
    stmt = select(User)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        current_user_id = user.id
    
    profile = await profile_service.get_full_profile(db, current_user_id)
    if not profile:
         raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/me", response_model=schemas.ProfileResponse)
async def update_my_profile(
    profile_in: schemas.ProfileUpdate,
    db: Session = Depends(deps.get_db)
):
    # Mock user
    current_user_id = "00000000-0000-0000-0000-000000000000"
    
    stmt = select(User)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        current_user_id = user.id
        
    return await profile_service.update_my_profile(db, current_user_id, profile_in)

@router.get("/{user_id}", response_model=schemas.UserProfileFullResponse)
async def read_user_profile(
    user_id: str,
    db: Session = Depends(deps.get_db)
):
    profile = await profile_service.get_full_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.get("/", response_model=List[schemas.UserProfileFullResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    """List all users for selection (e.g., in event organizer dropdown)"""
    stmt = select(User).offset(skip).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    # Convert to profile responses
    profiles = []
    for user in users:
        profile = await profile_service.get_full_profile(db, user.id)
        if profile:
            profiles.append(profile)
    
    return profiles
