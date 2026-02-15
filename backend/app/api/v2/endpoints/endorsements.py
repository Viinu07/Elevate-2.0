from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Any
from app.api import deps
from app.schemas.v2 import endorsement as schemas
from app.services import endorsement_service
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.EndorsementResponse, status_code=status.HTTP_201_CREATED)
async def create_endorsement(
    endorsement_in: schemas.EndorsementCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return await endorsement_service.create_endorsement(db, endorsement_in, current_user.id)

@router.get("/", response_model=List[schemas.EndorsementResponse])
async def read_endorsements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return await endorsement_service.get_endorsements_with_stats(db, current_user.id, skip=skip, limit=limit)

# Social Interactions
from app.models.social import Like, Comment
from app.schemas.v2.post import CommentCreate, CommentResponse
from sqlalchemy import and_

@router.post("/{endorsement_id}/like", response_model=bool)
async def like_endorsement(
    endorsement_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    current_user_id = current_user.id

    stmt = select(Like).where(
        and_(Like.user_id == current_user_id, Like.endorsement_id == endorsement_id)
    )
    result = await db.execute(stmt)
    existing_like = result.scalars().first()

    if existing_like:
        await db.delete(existing_like)
        await db.commit()
        return False
    else:
        new_like = Like(user_id=current_user_id, endorsement_id=endorsement_id)
        db.add(new_like)
        await db.commit()
        return True

@router.get("/{endorsement_id}/likes", response_model=List[Any])
async def get_endorsement_likes(
    endorsement_id: str,
    db: Session = Depends(deps.get_db),
):
    stmt = (
        select(User)
        .join(Like, Like.user_id == User.id)
        .where(Like.endorsement_id == endorsement_id)
        .limit(10)
    )
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [{"id": u.id, "name": u.name, "avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={u.name}"} for u in users]

@router.post("/{endorsement_id}/comments", response_model=CommentResponse)
async def create_endorsement_comment(
    endorsement_id: str,
    comment_in: CommentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    current_user_id = current_user.id

    comment = Comment(
        content=comment_in.content,
        endorsement_id=endorsement_id,
        user_id=current_user_id
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    
    from sqlalchemy.orm import selectinload
    stmt = select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.get("/{endorsement_id}/comments", response_model=List[CommentResponse])
async def get_endorsement_comments(
    endorsement_id: str,
    db: Session = Depends(deps.get_db),
):
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.endorsement_id == endorsement_id)
        .order_by(Comment.created_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/{endorsement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_endorsement(
    endorsement_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.v2.endorsement import Endorsement
    
    # Fetch the endorsement
    stmt = select(Endorsement).where(Endorsement.id == endorsement_id)
    result = await db.execute(stmt)
    endorsement = result.scalars().first()
    
    if not endorsement:
        raise HTTPException(status_code=404, detail="Endorsement not found")
    
    # Check if the current user is the giver or an admin (admins can delete any)
    # For now, allow deletion if user is the giver. Add role check later if needed.
    if endorsement.giver_id != current_user.id:
        # Could add: and current_user.role != "admin"
        raise HTTPException(status_code=403, detail="Not authorized to delete this endorsement")
    
    await db.delete(endorsement)
    await db.commit()
    return None
