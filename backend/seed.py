
import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Load .env file manually (same as verification script)
env_path = os.path.join(os.getcwd(), 'backend', '.env')
if os.path.exists(env_path):
    print(f"Loading environment from {env_path}")
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                os.environ[key] = value

from app.db.session import AsyncSessionLocal
from app.models.team import ART, Team
from app.models.user import User
from app.models.feedback import AwardCategory
from app.core.config import settings

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("🌱 Seeding data...")
        
        # 1. Create Award Categories
        awards = [
            {"id": "pinnacle-pursuit", "name": "Pinnacle Pursuit Award", "icon": "🎯", "description": "Reaching the highest standards of excellence"},
            {"id": "sherpa", "name": "The Sherpa Award", "icon": "🏔️", "description": "Guiding and supporting team members"},
            {"id": "sticky-wicket", "name": "The Sticky Wicket Award", "icon": "🏏", "description": "Navigating through difficult challenges"},
            {"id": "bulls-by-horn", "name": "Take the Bulls by the Horn Award", "icon": "🐂", "description": "Bold initiative and decisive action"}
        ]
        
        for award_data in awards:
            existing = await db.get(AwardCategory, award_data["id"])
            if not existing:
                db.add(AwardCategory(**award_data))
                print(f"Created Award: {award_data['name']}")

        # 2. Create ARTs and Teams
        art_ascent = ART(id="art-1", name="Ascent")
        db.add(art_ascent)
        
        team_olympus = Team(id="t-1", name="Olympus", art=art_ascent)
        team_app_builder = Team(id="t-2", name="App Builder", art=art_ascent)
        db.add(team_olympus)
        db.add(team_app_builder)
        
        print("Created ARTs and Teams")

        # 3. Create Users
        users = [
            {"id": "u-1", "name": "Viinu", "email": "viinu@elevate.com", "role": "Admin", "team": team_olympus},
            {"id": "m-1", "name": "Alice Johnson", "email": "alice@elevate.com", "role": "Tech Lead", "team": team_olympus},
            {"id": "m-2", "name": "Bob Smith", "email": "bob@elevate.com", "role": "Senior Dev", "team": team_olympus},
            {"id": "m-4", "name": "David Lee", "email": "david@elevate.com", "role": "Frontend Dev", "team": team_app_builder}
        ]
        
        for user_data in users:
            u = User(
                id=user_data["id"],
                name=user_data["name"],
                email=user_data["email"],
                role=user_data["role"],
                team=user_data["team"],
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data['name']}"
            )
            db.add(u)
            print(f"Created User: {user_data['name']}")

        try:
            await db.commit()
            print("✅ Seeding completed successfully!")
        except Exception as e:
            print(f"❌ Error seeding data: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_data())
