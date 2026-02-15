from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.crud.base import CRUDBase
from app.models.v2.notification import Notification, NotificationPreference
from app.schemas.v2.notification import NotificationCreate, NotificationPreferenceUpdate

class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationCreate]):
    async def get_by_user(self, db: Session, user_id: str, skip: int = 0, limit: int = 50, only_unread: bool = False) -> List[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        if only_unread:
            stmt = stmt.where(Notification.is_read == False)
        stmt = stmt.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def mark_all_as_read(self, db: Session, user_id: str) -> int:
        stmt = update(Notification).where(
            Notification.user_id == user_id, 
            Notification.is_read == False
        ).values(is_read=True)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount

class CRUDNotificationPreference(CRUDBase[NotificationPreference, NotificationPreferenceUpdate, NotificationPreferenceUpdate]):
    async def get_by_user(self, db: Session, user_id: str) -> List[NotificationPreference]:
        stmt = select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalars().all()

notification = CRUDNotification(Notification)
preference = CRUDNotificationPreference(NotificationPreference)
