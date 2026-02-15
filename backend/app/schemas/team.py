
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from .user import User, UserInTeam

# --- ART ---
class ARTBase(BaseModel):
    name: Optional[str] = None

class ARTCreate(ARTBase):
    name: str
    id: Optional[str] = None

class ARTUpdate(ARTBase):
    pass

class ARTInDBBase(ARTBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ART(ARTInDBBase):
    teams: List["Team"] = []


# --- Team ---
class TeamBase(BaseModel):
    name: Optional[str] = None
    art_id: Optional[str] = None

class TeamCreate(TeamBase):
    name: str
    id: Optional[str] = None
    art_id: str

class TeamUpdate(TeamBase):
    pass

class TeamInDBBase(TeamBase):
    id: str
    art_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class Team(TeamInDBBase):
    members: List[UserInTeam] = []
