
from typing import Any, Dict, List, Optional, Union

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.team import Team, ART
from app.schemas.team import TeamCreate, TeamUpdate, ARTCreate, ARTUpdate

class CRUDTeam(CRUDBase[Team, TeamCreate, TeamUpdate]):
    async def get(self, db: AsyncSession, id: Any) -> Optional[Team]:
        result = await db.execute(
            select(Team).options(selectinload(Team.members), selectinload(Team.art)).filter(Team.id == id)
        )
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Team]:
        result = await db.execute(
            select(Team).options(selectinload(Team.members), selectinload(Team.art)).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: TeamCreate) -> Team:
        db_obj = Team(name=obj_in.name, art_id=obj_in.art_id, id=obj_in.id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return await self.get(db, db_obj.id)

class CRUDART(CRUDBase[ART, ARTCreate, ARTUpdate]):
    async def get(self, db: AsyncSession, id: Any) -> Optional[ART]:
        result = await db.execute(
            select(ART).options(selectinload(ART.teams).selectinload(Team.members)).filter(ART.id == id)
        )
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[ART]:
        result = await db.execute(
            select(ART).options(selectinload(ART.teams).selectinload(Team.members)).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: ARTCreate) -> ART:
        db_obj = ART(name=obj_in.name, id=obj_in.id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return await self.get(db, db_obj.id)

team = CRUDTeam(Team)
art = CRUDART(ART)
