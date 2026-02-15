from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

# Shared properties
class TeamUpdateBase(BaseModel):
    content: str

# Properties to receive on (internal) creation
class TeamUpdateCreate(TeamUpdateBase):
    team_id: str
    user_id: str

# Properties to receive on API creation (from request)
class TeamUpdateCreateRequest(TeamUpdateBase):
    pass

# Properties to receive on update
class TeamUpdateUpdate(TeamUpdateBase):
    pass

# Properties shared by models stored in DB
class TeamUpdateInDBBase(TeamUpdateBase):
    id: str
    team_id: str
    user_id: str
    created_at: datetime
    # Computed / Joined fields
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class TeamUpdate(TeamUpdateInDBBase):
    pass
