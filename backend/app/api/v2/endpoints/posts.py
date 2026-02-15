from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_, delete
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.post import Post
from app.models.social import Like, Comment
from app.models.user import User
from app.schemas.v2.post import PostCreate, PostResponse, CommentCreate, CommentResponse

router = APIRouter()

@router.get("/", response_model=List[PostResponse])
async def read_posts(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve posts with like/comment counts and user status.
    """
    # 1. Fetch posts
    stmt = (
        select(Post)
        .options(selectinload(Post.author).selectinload(User.team))
        .order_by(desc(Post.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()

    if not posts:
        return []

    post_ids = [p.id for p in posts]

    # 2. Fetch Like Counts
    stmt_likes = (
        select(Like.post_id, func.count(Like.id))
        .where(Like.post_id.in_(post_ids))
        .group_by(Like.post_id)
    )
    result_likes = await db.execute(stmt_likes)
    like_counts = {row[0]: row[1] for row in result_likes.all()}

    # 3. Fetch Comment Counts
    stmt_comments = (
        select(Comment.post_id, func.count(Comment.id))
        .where(Comment.post_id.in_(post_ids))
        .group_by(Comment.post_id)
    )
    result_comments = await db.execute(stmt_comments)
    comment_counts = {row[0]: row[1] for row in result_comments.all()}

    # 4. Fetch User Likes
    stmt_user_likes = (
        select(Like.post_id)
        .where(and_(Like.post_id.in_(post_ids), Like.user_id == current_user.id))
    )
    result_user_likes = await db.execute(stmt_user_likes)
    user_liked_post_ids = set(result_user_likes.scalars().all())

    # 5. Assemble Response
    response = []
    for post in posts:
        # Create Pydantic model from ORM object
        post_response = PostResponse.model_validate(post)
        
        # Override fields
        post_response.likes = like_counts.get(post.id, 0)
        post_response.comments = comment_counts.get(post.id, 0)
        post_response.liked_by_user = post.id in user_liked_post_ids
        
        response.append(post_response)
    
    return response

@router.post("/", response_model=PostResponse)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new post.
    """
    post = Post(
        content=post_in.content,
        images=post_in.images,
        author_id=current_user.id
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    
    # Eager load for response
    stmt = select(Post).options(selectinload(Post.author).selectinload(User.team)).where(Post.id == post.id)
    result = await db.execute(stmt)
    created_post = result.scalars().first()
    return created_post
    
@router.post("/{post_id}/like", response_model=bool)
async def like_post(
    post_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Toggle like on a post. Returns True if liked, False if unliked.
    """
    # Check if already liked
    stmt = select(Like).where(
        and_(Like.user_id == current_user.id, Like.post_id == post_id)
    )
    result = await db.execute(stmt)
    existing_like = result.scalars().first()

    if existing_like:
        await db.delete(existing_like)
        await db.commit()
        return False
    else:
        new_like = Like(user_id=current_user.id, post_id=post_id)
        db.add(new_like)
        await db.commit()
        return True

@router.get("/{post_id}/likes", response_model=List[Any]) # Typed as Any to avoid circular import issues for now, or use UserBasicInfo if imported
async def get_post_likes(
    post_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get users who liked a post.
    """
    stmt = (
        select(User)
        .join(Like, Like.user_id == User.id)
        .where(Like.post_id == post_id)
        .limit(10) # Limit to 10 for tooltip
    )
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    # Return basic info
    return [{"id": u.id, "name": u.name, "avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={u.name}"} for u in users]

@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: str,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Add a comment to a post.
    """
    comment = Comment(
        content=comment_in.content,
        post_id=post_id,
        user_id=current_user.id
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    
    # Eager load user for response
    stmt = select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    post_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get comments for a post.
    """
    stmt = (
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/{post_id}", response_model=bool)
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a post. Only the author can delete their own post.
    """
    stmt = select(Post).where(Post.id == post_id)
    result = await db.execute(stmt)
    post = result.scalars().first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    await db.delete(post)
    await db.commit()
    return True
