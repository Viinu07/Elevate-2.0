from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

# Shared properties
class FeedbackBase(BaseModel):
    content: str

# Properties to receive on creation
class FeedbackCreate(FeedbackBase):
    from_user_id: str
    to_user_id: str

# Properties to receive on update
class FeedbackUpdate(FeedbackBase):
    pass

# Properties shared by models stored in DB
class FeedbackInDBBase(FeedbackBase):
    id: str
    from_user_id: str
    to_user_id: str
    date: datetime
    reaction: Optional[str] = None  # helpful, appreciate, insightful, acknowledged
    reply: Optional[str] = None  # Action plan or response
    # Computed fields
    from_user_name: Optional[str] = None
    to_user_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class Feedback(FeedbackInDBBase):
    pass
