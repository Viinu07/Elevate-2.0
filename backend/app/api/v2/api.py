from fastapi import APIRouter
from .endpoints import events, endorsements, releases, testing, analytics, tasks, notifications, profiles, search, auth, posts

api_router = APIRouter()

api_router.include_router(events.router, prefix="/events", tags=["Events V2"])
api_router.include_router(endorsements.router, prefix="/endorsements", tags=["Endorsements V2"])
api_router.include_router(releases.router, prefix="/releases", tags=["Releases V2"])
api_router.include_router(testing.router, prefix="/testing", tags=["Testing V2"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics V2"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks V2"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications V2"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["Profiles V2"])
api_router.include_router(search.router, prefix="/search", tags=["Search V2"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth V2"])
api_router.include_router(posts.router, prefix="/posts", tags=["Posts V2"])
# api_router.include_router(releases.router, prefix="/releases", tags=["Releases V2"])
# api_router.include_router(releases.router, prefix="/releases", tags=["Releases V2"])

@api_router.get("/")
async def root():
    return {"message": "Elevate V2 API"}
