
from typing import List
import uuid

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate


class CRUDFeedback(CRUDBase[Feedback, FeedbackCreate, FeedbackUpdate]):
    async def get_received(
        self, db: AsyncSession, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        """Get feedback received by a user"""
        result = await db.execute(
            select(Feedback)
            .options(selectinload(Feedback.from_user), selectinload(Feedback.to_user))
            .filter(Feedback.to_user_id == user_id)
            .order_by(desc(Feedback.date))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_sent(
        self, db: AsyncSession, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        """Get feedback sent by a user"""
        result = await db.execute(
            select(Feedback)
            .options(selectinload(Feedback.from_user), selectinload(Feedback.to_user))
            .filter(Feedback.from_user_id == user_id)
            .order_by(desc(Feedback.date))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(
        self, db: AsyncSession, *, obj_in: FeedbackCreate
    ) -> Feedback:
        """Create feedback with from_user_id from the request"""
        db_obj = Feedback(
            id=str(uuid.uuid4()),
            content=obj_in.content,
            from_user_id=obj_in.from_user_id,
            to_user_id=obj_in.to_user_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Re-fetch with relationships loaded
        result = await db.execute(
            select(Feedback)
            .options(selectinload(Feedback.from_user), selectinload(Feedback.to_user))
            .filter(Feedback.id == db_obj.id)
        )
        return result.scalars().first()


feedback = CRUDFeedback(Feedback)
