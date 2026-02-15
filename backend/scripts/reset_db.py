import asyncio
import sys
import os

# Add backend directory to path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def reset_db():
    async with AsyncSessionLocal() as session:
        print("Clearing database...")
        # Disable foreign key checks temporarily to allow truncating in any order
        # (Postgres doesn't support disabling FK checks easily for TRUNCATE, so we use DELETE)
        
        # Delete in order of dependencies
        await session.execute(text("DELETE FROM teamupdate"))
        await session.execute(text("DELETE FROM public.user"))
        await session.execute(text("DELETE FROM team"))
        await session.execute(text("DELETE FROM art"))
        
        print("Database cleared.")
        
        # Seed default user
        print("Seeding default Admin user...")
        # We use raw SQL to avoid importing models/crud if possible, or just to be quick
        # ID needs to be a UUID
        import uuid
        admin_id = str(uuid.uuid4())
        await session.execute(
            text("INSERT INTO public.user (id, name, role) VALUES (:id, :name, :role)"),
            {"id": admin_id, "name": "Admin User", "role": "Administrator"}
        )
        
        await session.commit()
        print(f"Default user created (ID: {admin_id})")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(reset_db())
