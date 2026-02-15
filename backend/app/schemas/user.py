from typing import Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, ConfigDict

class UserRole(str, Enum):
    BASIC = "Basic User"
    ADMIN = "Admin User"

# Shared properties
class UserBase(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    team_id: Optional[str] = None

# Properties to receive on creation
class UserCreate(UserBase):
    name: str
    role: Optional[str] = None
    id: Optional[str] = None

# Properties to receive on update
class UserUpdate(UserBase):
    pass

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)

# Minimal User schema for embedding in Team
class UserInTeam(UserInDBBase):
    pass

# Properties to return to client (Full User)
class User(UserInDBBase):
    # Flat API fields (Computed) - Only included in full User response
    team_name: Optional[str] = None
    art_id: Optional[str] = None
    art_name: Optional[str] = None
