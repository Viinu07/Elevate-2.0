from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    SUCCESS = "SUCCESS"
    MENTION = "MENTION"
    ASSIGNMENT = "ASSIGNMENT"

class NotificationChannel(str, Enum):
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"

class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType = NotificationType.INFO
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationPreferenceBase(BaseModel):
    notification_type: NotificationType
    channel: NotificationChannel
    enabled: bool

class NotificationPreferenceUpdate(BaseModel):
    enabled: bool

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: str
    user_id: str
    updated_at: datetime
    
    class Config:
        from_attributes = True
