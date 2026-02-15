from sqlalchemy.orm import Session, selectinload
from app.crud.v2 import endorsement as crud_endorsement
from app.schemas.v2 import endorsement as schemas
from app.models.v2.endorsement import Endorsement
from app.models.user import User
from app.models.social import Like, Comment
from sqlalchemy import select, func, and_, desc
import uuid

async def create_endorsement(db: Session, endorsement_in: schemas.EndorsementCreate, giver_id: str) -> dict:
    endorsement_data = endorsement_in.model_dump()
    endorsement_data["id"] = str(uuid.uuid4())
    endorsement_data["giver_id"] = giver_id
    
    db_obj = Endorsement(**endorsement_data)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    # Eager load relationships for response
    stmt = (
        select(Endorsement)
        .options(
            selectinload(Endorsement.giver).selectinload(User.team),
            selectinload(Endorsement.receiver).selectinload(User.team),
            selectinload(Endorsement.event)
        )
        .where(Endorsement.id == db_obj.id)
    )
    result = await db.execute(stmt)
    endorsement = result.scalars().first()
    
    # Build response dict with required fields
    return {
        "id": endorsement.id,
        "giver_id": endorsement.giver_id,
        "receiver_id": endorsement.receiver_id,
        "category": endorsement.category,
        "message": endorsement.message,
        "project_id": endorsement.project_id,
        "event_id": endorsement.event_id,
        "skills": endorsement.skills,
        "created_at": endorsement.created_at,
        "giver_name": endorsement.giver.name if endorsement.giver else "Unknown",
        "receiver_name": endorsement.receiver.name if endorsement.receiver else "Unknown",
        "giver_team": endorsement.giver.team.name if endorsement.giver and endorsement.giver.team else None,
        "receiver_team": endorsement.receiver.team.name if endorsement.receiver and endorsement.receiver.team else None,
        "event_name": endorsement.event.name if endorsement.event else None,
        "giver_avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={endorsement.giver.name if endorsement.giver else 'Unknown'}",
        "receiver_avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={endorsement.receiver.name if endorsement.receiver else 'Unknown'}",
        "likes": 0,
        "comments": 0,
        "liked_by_user": False
    }


async def get_endorsements(db: Session, skip: int = 0, limit: int = 100) -> list[Endorsement]:
    return await crud_endorsement.endorsement.get_multi(db, skip=skip, limit=limit)

async def get_endorsements_with_stats(db: Session, current_user_id: str, skip: int = 0, limit: int = 100) -> list[dict]:
    # 1. Fetch Endorsements
    stmt = (
        select(Endorsement)
        .options(
            selectinload(Endorsement.giver).selectinload(User.team),
            selectinload(Endorsement.receiver).selectinload(User.team),
            selectinload(Endorsement.event)
        )
        .order_by(desc(Endorsement.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    endorsements = result.scalars().all()
    
    if not endorsements:
        return []
        
    endorsement_ids = [e.id for e in endorsements]
    
    # 2. Fetch Like Counts
    stmt_likes = (
        select(Like.endorsement_id, func.count(Like.id))
        .where(Like.endorsement_id.in_(endorsement_ids))
        .group_by(Like.endorsement_id)
    )
    result_likes = await db.execute(stmt_likes)
    like_counts = {row[0]: row[1] for row in result_likes.all()}
    
    # 3. Fetch Comment Counts
    stmt_comments = (
        select(Comment.endorsement_id, func.count(Comment.id))
        .where(Comment.endorsement_id.in_(endorsement_ids))
        .group_by(Comment.endorsement_id)
    )
    result_comments = await db.execute(stmt_comments)
    comment_counts = {row[0]: row[1] for row in result_comments.all()}
    
    # 4. Fetch User Likes
    stmt_user_likes = (
        select(Like.endorsement_id)
        .where(and_(Like.endorsement_id.in_(endorsement_ids), Like.user_id == current_user_id))
    )
    result_user_likes = await db.execute(stmt_user_likes)
    user_liked_ids = set(result_user_likes.scalars().all())
    
    # 5. Assemble Response
    response = []
    for endorsement in endorsements:
        # Build dict manually with all required fields
        endorsement_dict = {
            "id": endorsement.id,
            "giver_id": endorsement.giver_id,
            "receiver_id": endorsement.receiver_id,
            "category": endorsement.category,
            "message": endorsement.message,
            "project_id": endorsement.project_id,
            "event_id": endorsement.event_id,
            "skills": endorsement.skills,
            "created_at": endorsement.created_at,
            "giver_name": endorsement.giver.name if endorsement.giver else "Unknown",
            "receiver_name": endorsement.receiver.name if endorsement.receiver else "Unknown",
            "giver_team": endorsement.giver.team.name if endorsement.giver and endorsement.giver.team else None,
            "receiver_team": endorsement.receiver.team.name if endorsement.receiver and endorsement.receiver.team else None,
            "event_name": endorsement.event.name if endorsement.event else None,
            "giver_avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={endorsement.giver.name if endorsement.giver else 'Unknown'}",
            "receiver_avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={endorsement.receiver.name if endorsement.receiver else 'Unknown'}",
            "likes": like_counts.get(endorsement.id, 0),
            "comments": comment_counts.get(endorsement.id, 0),
            "liked_by_user": endorsement.id in user_liked_ids
        }
        
        response.append(endorsement_dict)
        
    return response

async def get_user_endorsements(db: Session, user_id: str, as_receiver: bool = True) -> list[Endorsement]:
    if as_receiver:
        return await crud_endorsement.endorsement.get_by_receiver(db, user_id)
    return await crud_endorsement.endorsement.get_by_giver(db, user_id)
