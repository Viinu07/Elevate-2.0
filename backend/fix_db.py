
import asyncio
from sqlalchemy import text
from app.db.session import engine

async def migrate():
    async with engine.begin() as conn:
        print("Adding description column...")
        try:
            await conn.execute(text("ALTER TABLE releaseworkitem ADD COLUMN description VARCHAR"))
            print("Added description column.")
        except Exception as e:
            print(f"Error adding description (might already exist): {e}")

        print("Adding poc_id column...")
        try:
            await conn.execute(text("ALTER TABLE releaseworkitem ADD COLUMN poc_id VARCHAR"))
            print("Added poc_id column.")
        except Exception as e:
            print(f"Error adding poc_id (might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
