from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TestCycleStatus(str, Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ABORTED = "ABORTED"

class TestExecutionStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    BLOCKED = "BLOCKED"
    SKIPPED = "SKIPPED"
    PENDING = "PENDING"

# Execution Schemas
class TestExecutionBase(BaseModel):
    title: str
    status: TestExecutionStatus = TestExecutionStatus.PENDING
    comments: Optional[str] = None
    defect_id: Optional[str] = None

class TestExecutionCreate(TestExecutionBase):
    cycle_id: str

class TestExecutionUpdate(BaseModel):
    status: Optional[TestExecutionStatus] = None
    comments: Optional[str] = None
    defect_id: Optional[str] = None
    executed_by_id: Optional[str] = None

class TestExecutionResponse(TestExecutionBase):
    id: str
    cycle_id: str
    executed_by_id: Optional[str] = None
    executed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Cycle Schemas
class TestingCycleBase(BaseModel):
    name: str
    status: TestCycleStatus = TestCycleStatus.PLANNED
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    release_id: str

class TestingCycleCreate(TestingCycleBase):
    pass

class TestingCycleUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[TestCycleStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class TestingCycleResponse(TestingCycleBase):
    id: str
    pass_rate: float
    created_at: datetime
    
    class Config:
        from_attributes = True
