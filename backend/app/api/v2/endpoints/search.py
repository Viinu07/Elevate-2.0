from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.schemas.v2.search import SearchResult
from app.services import search_service

router = APIRouter()

@router.get("/", response_model=List[SearchResult])
async def search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(deps.get_db)
):
    return await search_service.search_all(db, q)
