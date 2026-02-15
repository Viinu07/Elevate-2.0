from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EndorsementBase(BaseModel):
    receiver_id: str
    category: str
    message: str
    project_id: Optional[str] = None
    event_id: Optional[str] = None
    skills: Optional[str] = None # JSON string or comma-separated

class EndorsementCreate(EndorsementBase):
    pass

class EndorsementResponse(EndorsementBase):
    id: str
    giver_id: str
    giver_name: str
    receiver_name: str
    receiver_avatar: Optional[str] = None 
    giver_avatar: Optional[str] = None
    giver_team: Optional[str] = None
    receiver_team: Optional[str] = None
    event_name: Optional[str] = None  # Name of event if awarded from event
    created_at: datetime
    
    # Social stats
    likes: int = 0
    comments: int = 0
    liked_by_user: bool = False
    
    class Config:
        from_attributes = True

class EndorsementSummary(BaseModel):
    id: str
    category: str
    giver_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True
