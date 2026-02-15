from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class SearchResultType(str, Enum):
    RELEASE = "RELEASE"
    WORK_ITEM = "WORK_ITEM"
    TASK = "TASK"
    EVENT = "EVENT"
    USER = "USER"

class SearchResult(BaseModel):
    id: str
    title: str
    type: SearchResultType
    subtitle: Optional[str] = None
    url: str
    
class SearchResponse(BaseModel):
    results: List[SearchResult]
    count: int
