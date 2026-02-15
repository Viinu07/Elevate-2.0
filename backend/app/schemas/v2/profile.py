from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProfileBase(BaseModel):
    bio: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    social_links: Dict[str, str] = {}

class ProfileCreate(ProfileBase):
    user_id: str

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    joined_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserProfileFullResponse(BaseModel):
    user_id: str
    name: str
    role: Optional[str] = None
    team: Optional[str] = None
    email: Optional[str] = None # May be restricted
    profile: Optional[ProfileResponse] = None
    
    # Activity Stats / Score
    impact_score: int = 0
    endorsements_count: int = 0
    work_items_count: int = 0
    tasks_count: int = 0
