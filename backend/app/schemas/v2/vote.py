from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VoteBase(BaseModel):
    event_id: str
    nominee_id: str
    award_category: str
    reason: Optional[str] = None

class VoteCreate(VoteBase):
    pass

class VoteResponse(VoteBase):
    id: str
    voter_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class VoteCount(BaseModel):
    nominee_id: str
    nominee_name: str
    nominee_avatar: str
    award_category: str
    count: int
