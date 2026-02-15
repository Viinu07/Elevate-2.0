
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

# Award Category
class AwardCategoryBase(BaseModel):
    name: str
    icon: str
    description: str

class AwardCategoryCreate(AwardCategoryBase):
    pass

class AwardCategory(AwardCategoryBase):
    id: str

    class Config:
        from_attributes = True

# Vote
class VoteBase(BaseModel):
    award_category_id: str
    nominee_id: str
    reason: Optional[str] = None

class VoteCreate(VoteBase):
    nominator_id: str

class Vote(VoteBase):
    id: str
    nominator_id: str
    timestamp: datetime
    # Computed field from relationship
    nominee_name: Optional[str] = None

    class Config:
        from_attributes = True
