from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.api import deps
from app.schemas.v2 import notification as schemas
from app.services import notification_service
from app.models.user import User
from app.crud.v2 import notification as crud_notification

router = APIRouter()

# --- Notifications ---

@router.get("/", response_model=List[schemas.NotificationResponse])
async def read_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(deps.get_db)
):
    # Mock user
    current_user_id = "00000000-0000-0000-0000-000000000000"
    
    stmt = select(User)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        current_user_id = user.id
        
    return await notification_service.get_my_notifications(db, current_user_id, unread_only)

@router.post("/read-all", response_model=int)
async def mark_all_read(
    db: Session = Depends(deps.get_db)
):
    # Mock user
    current_user_id = "00000000-0000-0000-0000-000000000000"
    
    stmt = select(User)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        current_user_id = user.id
        
    return await notification_service.mark_all_read(db, current_user_id)

@router.patch("/{id}/read", response_model=schemas.NotificationResponse)
async def mark_read(
    id: str,
    db: Session = Depends(deps.get_db)
):
    notification = await notification_service.mark_read(db, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

# --- Preferences ---

@router.get("/preferences", response_model=List[schemas.NotificationPreferenceResponse])
async def read_preferences(
    db: Session = Depends(deps.get_db)
):
    # Mock user
    current_user_id = "00000000-0000-0000-0000-000000000000"
    
    stmt = select(User)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user:
        current_user_id = user.id
    
    return await crud_notification.preference.get_by_user(db, current_user_id)
