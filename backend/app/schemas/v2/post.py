from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# Shared properties
class PostBase(BaseModel):
    content: str
    images: Optional[List[str]] = []

# Properties to receive on creation
class PostCreate(PostBase):
    pass

# Comment Schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserBasicInfo(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True

# Properties to return to client
class PostResponse(PostBase):
    id: str
    created_at: datetime
    author_id: str
    author_name: str
    author_role: Optional[str] = None
    author_team: Optional[str] = None
    likes: int = 0
    comments: int = 0
    liked_by_user: bool = False  # New field
    latest_comments: List[CommentResponse] = [] # Optional preview

    class Config:
        from_attributes = True
