from typing import Optional
from pydantic import BaseModel, field_validator

class TestingGate(BaseModel):
    checked: bool
    date: str

class ReleaseWorkItemBase(BaseModel):
    title: str
    team_name: str
    release_version: str
    description: Optional[str] = None
    poc_id: Optional[str] = None
    
    unit_testing_checked: bool = False
    unit_testing_date: Optional[str] = None
    
    system_testing_checked: bool = False
    system_testing_date: Optional[str] = None
    
    int_testing_checked: bool = False
    int_testing_date: Optional[str] = None
    
    pvs_testing: bool = False
    pvs_intake_number: Optional[str] = None
    warranty_call_needed: bool = False
    confluence_updated: bool = False
    csca_intake: str = "No"
    
    # Status & Timeline
    status: str = "Proposed"
    is_completed: bool = False
    completed_at: Optional[str] = None
    release_date: Optional[str] = None

    @field_validator('status', mode='before')
    @classmethod
    def set_default_status(cls, v):
        return v or "Proposed"

class ReleaseWorkItemCreate(ReleaseWorkItemBase):
    id: int # Accepting ID from frontend to match Date.now() logic if desired, or we can make it optional

class ReleaseWorkItemUpdate(BaseModel):
    title: Optional[str] = None
    team_name: Optional[str] = None
    release_version: Optional[str] = None
    description: Optional[str] = None
    poc_id: Optional[str] = None
    
    unit_testing_checked: Optional[bool] = None
    unit_testing_date: Optional[str] = None
    
    system_testing_checked: Optional[bool] = None
    system_testing_date: Optional[str] = None
    
    int_testing_checked: Optional[bool] = None
    int_testing_date: Optional[str] = None
    
    pvs_testing: Optional[bool] = None
    pvs_intake_number: Optional[str] = None
    warranty_call_needed: Optional[bool] = None
    confluence_updated: Optional[bool] = None
    csca_intake: Optional[str] = None
    
    status: Optional[str] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[str] = None
    release_date: Optional[str] = None

class ReleaseWorkItem(ReleaseWorkItemBase):
    id: int
    poc_name: Optional[str] = None

    class Config:
        from_attributes = True
