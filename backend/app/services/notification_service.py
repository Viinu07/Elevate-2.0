from sqlalchemy.orm import Session
from app.crud.v2 import notification as crud_notification
from app.schemas.v2 import notification as schemas
from app.models.v2.notification import Notification, NotificationPreference, NotificationType, NotificationChannel
import uuid

async def send_notification(db: Session, notification_in: schemas.NotificationCreate) -> Notification:
    # 1. Check preferences (mock logic: always send in-app if no pref exists)
    # prefs = await crud_notification.preference.get_by_user(db, notification_in.user_id)
    # ... logic to check if enabled ...
    
    # 2. Create in-app notification
    notification_data = notification_in.model_dump()
    notification_data["id"] = str(uuid.uuid4())
    
    db_obj = Notification(**notification_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # 3. If email enabled, trigger email (mock print)
    # print(f"Sending email to {notification_in.user_id}: {notification_in.title}")
    
    return db_obj

async def get_my_notifications(db: Session, user_id: str, unread_only: bool = False) -> list[Notification]:
    return await crud_notification.notification.get_by_user(db, user_id, only_unread=unread_only)

async def mark_read(db: Session, notification_id: str) -> Notification:
    db_obj = await crud_notification.notification.get(db, id=notification_id)
    if db_obj:
        db_obj.is_read = True
        db.commit()
        db.refresh(db_obj)
    return db_obj

async def mark_all_read(db: Session, user_id: str):
    return await crud_notification.notification.mark_all_as_read(db, user_id)
