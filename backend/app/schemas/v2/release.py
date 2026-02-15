from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ReleaseStatus(str, Enum):
    PLANNING = "PLANNING"
    DEVELOPMENT = "DEVELOPMENT"
    TESTING = "TESTING"
    STAGING = "STAGING"
    PRODUCTION = "PRODUCTION"
    COMPLETED = "COMPLETED"

class ReleaseBase(BaseModel):
    version: str
    name: Optional[str] = None
    status: ReleaseStatus = ReleaseStatus.PLANNING
    start_date: Optional[datetime] = None
    release_date: Optional[datetime] = None

class ReleaseCreate(ReleaseBase):
    pass

class ReleaseUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ReleaseStatus] = None
    start_date: Optional[datetime] = None
    release_date: Optional[datetime] = None
    actual_release_date: Optional[datetime] = None

class ReleaseResponse(ReleaseBase):
    id: str
    completion_percentage: int
    health_score: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Work Item Schemas
class WorkItemType(str, Enum):
    FEATURE = "FEATURE"
    BUG = "BUG"
    TASK = "TASK"
    IMPROVEMENT = "IMPROVEMENT"

class WorkItemStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    TESTING = "TESTING"
    DONE = "DONE"

class WorkItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: WorkItemType = WorkItemType.FEATURE
    status: WorkItemStatus = WorkItemStatus.TODO
    priority: str = "Medium"
    story_points: Optional[int] = None
    release_id: Optional[str] = None
    assignee_id: Optional[str] = None
    team_id: Optional[str] = None

class WorkItemCreate(WorkItemBase):
    pass

class WorkItemUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[WorkItemStatus] = None
    release_id: Optional[str] = None
    assignee_id: Optional[str] = None

class WorkItemResponse(WorkItemBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReleaseDetailResponse(ReleaseResponse):
    pass
    # work_items: List[WorkItemResponse] = []
