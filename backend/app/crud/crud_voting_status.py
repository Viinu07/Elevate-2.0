
from typing import Optional
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.voting_status import VotingStatus
from app.schemas.voting_status import VotingStatusUpdate


class CRUDVotingStatus:
    async def get_current_status(self, db: AsyncSession) -> Optional[VotingStatus]:
        """Get the current voting status (single row)"""
        result = await db.execute(
            select(VotingStatus).filter(VotingStatus.id == "default")
        )
        return result.scalars().first()
    
    async def update_status(
        self, db: AsyncSession, *, is_open: Optional[bool] = None, results_visible: Optional[bool] = None, updated_by: Optional[str] = None
    ) -> VotingStatus:
        """Update voting status"""
        status = await self.get_current_status(db)
        
        if not status:
            # Create default status if it doesn't exist
            status = VotingStatus(
                id="default",
                is_voting_open=is_open if is_open is not None else False,
                results_visible=results_visible if results_visible is not None else False,
                updated_by=updated_by
            )
            db.add(status)
        else:
            if is_open is not None:
                status.is_voting_open = is_open
            if results_visible is not None:
                status.results_visible = results_visible
            if updated_by:
                status.updated_by = updated_by
        
        await db.commit()
        await db.refresh(status)
        return status


voting_status = CRUDVotingStatus()
