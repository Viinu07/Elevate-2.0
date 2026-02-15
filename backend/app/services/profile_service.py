from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.crud.v2 import profile as crud_profile
from app.schemas.v2 import profile as schemas
from app.models.v2.profile import Profile
from app.models.user import User
from app.models.v2.endorsement import Endorsement
from app.models.v2.work_item import WorkItem, WorkItemStatus
from app.models.v2.task import Task, TaskStatus
import uuid

async def get_full_profile(db: AsyncSession, user_id: str) -> schemas.UserProfileFullResponse:
    # 1. Get User
    stmt = select(User).options(selectinload(User.team)).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        return None
        
    # 2. Get Profile (create empty if not exists for non-null response)
    profile = await crud_profile.profile.get_by_user_id(db, user_id)
    
    # 3. Calculate Score components
    stmt = select(func.count(Endorsement.id)).where(Endorsement.receiver_id == user_id)
    result = await db.execute(stmt)
    endorsements_count = result.scalar() or 0
    
    # Work Items (Done)
    stmt = select(func.count(WorkItem.id)).where(
        WorkItem.assignee_id == user_id, 
        WorkItem.status == WorkItemStatus.DONE
    )
    result = await db.execute(stmt)
    work_items_count = result.scalar() or 0
    
    # Tasks (Done)
    stmt = select(func.count(Task.id)).where(
        Task.assigned_to_id == user_id, 
        Task.status == TaskStatus.DONE
    )
    result = await db.execute(stmt)
    tasks_count = result.scalar() or 0
    
    # Simple algorithm
    score = (endorsements_count * 10) + (work_items_count * 5) + (tasks_count * 2)
    
    return schemas.UserProfileFullResponse(
        user_id=user.id,
        name=user.name,
        role=user.role,
        team=user.team_name,
        # email=None, # Removed from User model
        profile=profile,
        impact_score=score,
        endorsements_count=endorsements_count,
        work_items_count=work_items_count,
        tasks_count=tasks_count
    )

async def update_my_profile(db: AsyncSession, user_id: str, profile_in: schemas.ProfileUpdate) -> Profile:
    profile = await crud_profile.profile.get_by_user_id(db, user_id)
    if not profile:
        # Create
        profile_data = profile_in.model_dump()
        profile_data["id"] = str(uuid.uuid4())
        profile_data["user_id"] = user_id
        profile = Profile(**profile_data)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    else:
        # Update
        profile = await crud_profile.profile.update(db, db_obj=profile, obj_in=profile_in)
        
    return profile
