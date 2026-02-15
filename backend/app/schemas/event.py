from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

# Shared properties
class EventBase(BaseModel):
    name: str
    date_time: datetime
    meeting_link: str

# Properties to receive on creation
class EventCreate(EventBase):
    organizer_id: str

# Properties to receive on update
class EventUpdate(BaseModel):
    name: str | None = None
    date_time: datetime | None = None
    meeting_link: str | None = None
    organizer_id: str | None = None

# Properties shared by models stored in DB
class EventInDBBase(EventBase):
    id: str
    organizer_id: str
    created_at: datetime
    # Computed fields
    organizer_name: Optional[str] = None
    organizer_team: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class Event(EventInDBBase):
    pass
