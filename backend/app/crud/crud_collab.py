
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.feedback import AwardCategory, Vote
from app.schemas.collab import AwardCategoryCreate, VoteCreate
import uuid

class CRUDAwardCategory(CRUDBase[AwardCategory, AwardCategoryCreate, AwardCategoryCreate]):
    pass

class CRUDVote(CRUDBase[Vote, VoteCreate, VoteCreate]):
    async def get_by_nominator(self, db: AsyncSession, *, nominator_id: str) -> List[Vote]:
        """Get all votes by a specific nominator with nominee loaded"""
        result = await db.execute(
            select(Vote)
            .options(selectinload(Vote.nominee))
            .filter(Vote.nominator_id == nominator_id)
        )
        return result.scalars().all()
    
    async def create(self, db: AsyncSession, *, obj_in: VoteCreate) -> Vote:
        """Create a vote with nominee relationship loaded"""
        db_obj = Vote(
            id=str(uuid.uuid4()),
            award_category_id=obj_in.award_category_id,
            nominator_id=obj_in.nominator_id,
            nominee_id=obj_in.nominee_id,
            reason=obj_in.reason
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Re-fetch with relationships loaded
        result = await db.execute(
            select(Vote)
            .options(selectinload(Vote.nominee))
            .filter(Vote.id == db_obj.id)
        )
        return result.scalars().first()
    
    async def get_category_results(
        self, db: AsyncSession, *, category_id: str
    ) -> List[Dict]:
        """Get top 3 voted users for a specific category"""
        from sqlalchemy import desc
        
        # Count votes per nominee for this category
        stmt = (
            select(
                Vote.nominee_id,
                func.count(Vote.id).label('vote_count')
            )
            .filter(Vote.award_category_id == category_id)
            .group_by(Vote.nominee_id)
            .order_by(desc('vote_count'))
            .limit(3)
        )
        
        result = await db.execute(stmt)
        rows = result.all()
        
        # Load user details for each nominee
        from app.models.user import User
        results = []
        for row in rows:
            user_result = await db.execute(
                select(User).filter(User.id == row.nominee_id)
            )
            user = user_result.scalars().first()
            if user:
                results.append({
                    'nominee_id': row.nominee_id,
                    'nominee_name': user.name,
                    'vote_count': row.vote_count
                })
        
        return results
    
    async def get_all_category_results(self, db: AsyncSession) -> Dict[str, List[Dict]]:
        """Get top 3 results for all categories"""
        # Get all categories
        categories = await award_category.get_multi(db, skip=0, limit=100)
        
        results = {}
        for category in categories:
            category_results = await self.get_category_results(db, category_id=category.id)
            results[category.id] = {
                'category_name': category.name,
                'category_icon': category.icon,
                'top_3': category_results
            }
        
        return results

award_category = CRUDAwardCategory(AwardCategory)
vote = CRUDVote(Vote)
