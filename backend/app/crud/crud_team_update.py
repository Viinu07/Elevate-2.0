from typing import List

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.team_update import TeamUpdate
from app.schemas.team_update import TeamUpdateCreate, TeamUpdateUpdate

class CRUDTeamUpdate(CRUDBase[TeamUpdate, TeamUpdateCreate, TeamUpdateUpdate]):
    async def get_multi_by_team(
        self, db: AsyncSession, *, team_id: str, skip: int = 0, limit: int = 100
    ) -> List[TeamUpdate]:
        result = await db.execute(
            select(TeamUpdate)
            .options(selectinload(TeamUpdate.user))
            .filter(TeamUpdate.team_id == team_id)
            .order_by(desc(TeamUpdate.created_at))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get(self, db: AsyncSession, id: str) -> TeamUpdate:
        result = await db.execute(
            select(TeamUpdate)
            .options(selectinload(TeamUpdate.user))
            .filter(TeamUpdate.id == id)
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: TeamUpdateCreate) -> TeamUpdate:
        db_obj = TeamUpdate(
            content=obj_in.content,
            team_id=obj_in.team_id,
            user_id=obj_in.user_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Re-fetch with relationship loaded
        return await self.get(db, db_obj.id)

team_update = CRUDTeamUpdate(TeamUpdate)
