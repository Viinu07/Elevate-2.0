import asyncio
import sys
import os
from dotenv import load_dotenv

# Add backend to path
backend_path = os.path.join(os.getcwd(), 'backend')
sys.path.append(backend_path)
load_dotenv(os.path.join(backend_path, '.env'))

from app.db.session import AsyncSessionLocal
from app.models.event import Event
from sqlalchemy import select

async def check_db():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Event))
        events = result.scalars().all()
        print(f"Found {len(events)} events in DB.")
        for event in events:
            print(f"Event: {event.name} (ID: {event.id})")
            print(f"  has_awards: {event.has_awards}")
            print(f"  voting_required: {event.voting_required}")
            print(f"  award_categories: {event.award_categories}")
            print("-" * 20)

if __name__ == "__main__":
    asyncio.run(check_db())
