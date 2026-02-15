from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from .endorsement import EndorsementSummary

# Enums
class EventStatus(str, Enum):
    UPCOMING = "UPCOMING"
    LIVE = "LIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class RSVPStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    TENTATIVE = "TENTATIVE"

# Mixins
class EventBase(BaseModel):
    name: str
    date_time: datetime
    meeting_link: str
    event_type: Optional[str] = None
    status: EventStatus = EventStatus.UPCOMING
    agenda: Optional[str] = None
    end_time: Optional[datetime] = None
    timezone: str = "UTC"
    has_awards: bool = False
    voting_required: bool = False
    award_categories: Optional[str] = None

class EventCreate(EventBase):
    organizer_id: Optional[str] = None  # Allow frontend to specify organizer

class EventUpdate(BaseModel):
    name: Optional[str] = None
    date_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    timezone: Optional[str] = None
    meeting_link: Optional[str] = None
    event_type: Optional[str] = None
    status: Optional[EventStatus] = None
    agenda: Optional[str] = None
    has_awards: Optional[bool] = None
    voting_required: Optional[bool] = None
    award_categories: Optional[str] = None

class EventStatusUpdate(BaseModel):
    status: EventStatus

class ParticipantCreate(BaseModel):
    user_id: str
    rsvp_status: Optional[RSVPStatus] = RSVPStatus.PENDING

class ParticipantResponse(BaseModel):
    id: str
    user_id: str
    user_name: str # Flattened for convenience
    rsvp_status: RSVPStatus
    attended: bool
    
    class Config:
        from_attributes = True

class EventResponse(EventBase):
    id: str
    organizer_id: str
    organizer_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class EventDetailResponse(EventResponse):
    participants: List[ParticipantResponse] = []
    # linked_releases: List[ReleaseSummary] = []
    # generated_tasks: List[TaskSummary] = []
    endorsements: List[EndorsementSummary] = []

class EventReleaseLink(BaseModel):
    release_id: str
    relationship_type: str = "relates_to"
