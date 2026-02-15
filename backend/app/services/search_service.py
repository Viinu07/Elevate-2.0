from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select
from app.schemas.v2.search import SearchResult, SearchResultType
from app.models.v2.release import Release
from app.models.v2.work_item import WorkItem
from app.models.v2.task import Task
from app.models.event import Event
from app.models.user import User
from typing import List

async def search_all(db: AsyncSession, query: str) -> List[SearchResult]:
    results = []
    if not query or len(query) < 2:
        return results
        
    search_term = f"%{query}%"
    
    # 1. Releases
    stmt = select(Release).filter(
        or_(Release.version.ilike(search_term), Release.theme.ilike(search_term))
    ).limit(5)
    result = await db.execute(stmt)
    releases = result.scalars().all()
    
    for r in releases:
        results.append(SearchResult(
            id=r.id,
            title=f"Release {r.version}",
            subtitle=r.theme,
            type=SearchResultType.RELEASE,
            url=f"/releases/{r.id}"
        ))
        
    # 2. Work Items
    stmt = select(WorkItem).filter(
        or_(WorkItem.title.ilike(search_term))
    ).limit(5)
    result = await db.execute(stmt)
    work_items = result.scalars().all()
    
    for w in work_items:
        results.append(SearchResult(
            id=w.id,
            title=w.title,
            subtitle=f"{w.type} - {w.status}",
            type=SearchResultType.WORK_ITEM,
            url=f"/releases/{w.release_id}?item={w.id}" # Simplification
        ))

    # 3. Tasks
    stmt = select(Task).filter(
        Task.title.ilike(search_term)
    ).limit(5)
    result = await db.execute(stmt)
    tasks = result.scalars().all()
    
    for t in tasks:
        results.append(SearchResult(
            id=t.id,
            title=t.title,
            subtitle=f"{t.priority} - {t.status}",
            type=SearchResultType.TASK,
            url=f"/tasks" # Task list
        ))
        
    # 4. Events
    stmt = select(Event).filter(
        Event.name.ilike(search_term) # Event uses name, not title
    ).limit(5)
    result = await db.execute(stmt)
    events = result.scalars().all()
    
    for e in events:
        results.append(SearchResult(
            id=e.id,
            title=e.name,
            subtitle=str(e.date_time),
            type=SearchResultType.EVENT,
            url=f"/events/{e.id}"
        ))
        
    # 5. Users
    stmt = select(User).filter(
        User.name.ilike(search_term)
    ).limit(5)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    for u in users:
        results.append(SearchResult(
            id=u.id,
            title=u.name,
            subtitle=u.role or "Team Member",
            type=SearchResultType.USER,
            url=f"/profile/{u.id}"
        ))
        
    return results
