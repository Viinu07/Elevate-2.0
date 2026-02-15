
from typing import Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.user import User
from app.models.team import Team
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get(self, db: AsyncSession, id: Any) -> Optional[User]:
        result = await db.execute(
            select(User)
            .options(selectinload(User.team).selectinload(Team.art))
            .filter(User.id == id)
        )
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[User]:
        result = await db.execute(
            select(User)
            .options(selectinload(User.team).selectinload(Team.art))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        db_obj = User(
            name=obj_in.name,
            role=obj_in.role,
            team_id=obj_in.team_id,
            id=obj_in.id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Re-fetch the user with relationships loaded so properties (team_name, art_name) work
        return await self.get(db, db_obj.id)

user = CRUDUser(User)
