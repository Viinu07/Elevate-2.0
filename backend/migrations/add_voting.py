import os
import sys
import asyncio

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from sqlalchemy import text
from app.db.session import engine

async def migrate():
    async with engine.begin() as conn:
        print("Adding voting_required column to event table...")
        try:
            await conn.execute(text("ALTER TABLE event ADD COLUMN IF NOT EXISTS voting_required BOOLEAN DEFAULT FALSE"))
            print("Added voting_required column.")
        except Exception as e:
            print(f"Error adding voting_required (might already exist): {e}")

        print("Creating event_vote table if not exists...")
        try:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS event_vote (
                    id VARCHAR PRIMARY KEY,
                    event_id VARCHAR NOT NULL REFERENCES event(id) ON DELETE CASCADE,
                    voter_id VARCHAR NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                    nominee_id VARCHAR NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                    award_category VARCHAR NOT NULL,
                    reason VARCHAR,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
                );
            """))
            # Indices
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_event_vote_id ON event_vote (id)"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_event_vote_event_id ON event_vote (event_id)"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_event_vote_voter_id ON event_vote (voter_id)"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_event_vote_nominee_id ON event_vote (nominee_id)"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_event_vote_award_category ON event_vote (award_category)"))
            
            print("Created event_vote table.")
        except Exception as e:
            print(f"Error creating event_vote table: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
