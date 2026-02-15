from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.v2.endorsement import Endorsement
from app.schemas.v2.endorsement import EndorsementCreate, EndorsementBase

class CRUDEndorsement(CRUDBase[Endorsement, EndorsementCreate, EndorsementBase]):
    async def get_by_receiver(self, db: Session, receiver_id: str, skip: int = 0, limit: int = 100) -> List[Endorsement]:
        stmt = select(Endorsement).where(Endorsement.receiver_id == receiver_id).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_by_giver(self, db: Session, giver_id: str, skip: int = 0, limit: int = 100) -> List[Endorsement]:
        stmt = select(Endorsement).where(Endorsement.giver_id == giver_id).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

endorsement = CRUDEndorsement(Endorsement)
