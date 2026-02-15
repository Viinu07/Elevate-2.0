from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.v2.profile import Profile
from app.schemas.v2.profile import ProfileCreate, ProfileUpdate

class CRUDProfile(CRUDBase[Profile, ProfileCreate, ProfileUpdate]):
    async def get_by_user_id(self, db: Session, user_id: str) -> Optional[Profile]:
        stmt = select(Profile).where(Profile.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()

profile = CRUDProfile(Profile)
