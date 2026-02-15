from fastapi import APIRouter
from app.api.v1.endpoints import users, teams, collab, team_updates, feedback, events, voting, releases

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(team_updates.router, prefix="/teams", tags=["team-updates"])
api_router.include_router(collab.router, prefix="/collab", tags=["collab"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(voting.router, prefix="/voting", tags=["voting"])
api_router.include_router(releases.router, prefix="/releases", tags=["releases"])
