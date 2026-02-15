from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
from app.api import deps
from app.core import security
from app.models.user import User

from typing import Optional
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    user_id: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    name: str
    role: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    art_id: Optional[str] = None
    art_name: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.post("/login-as", response_model=Token)
async def login_as(
    login_data: LoginRequest,
    db: Session = Depends(deps.get_db)
):
    """
    Dev/Test Endpoint: Issue a token for a specific user ID.
    """
    result = await db.execute(select(User).where(User.id == login_data.user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    access_token = security.create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get current user.
    """
    return current_user
