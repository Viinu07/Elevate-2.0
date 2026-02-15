from datetime import datetime
from pydantic import BaseModel, ConfigDict

# Shared properties
class VotingStatusBase(BaseModel):
    is_voting_open: bool
    results_visible: bool = False

# Properties for update
class VotingStatusUpdate(VotingStatusBase):
    is_voting_open: bool | None = None
    results_visible: bool | None = None
    updated_by: str | None = None

# Properties to return to client
class VotingStatus(VotingStatusBase):
    id: str
    updated_at: datetime
    updated_by: str | None = None
    
    model_config = ConfigDict(from_attributes=True)
