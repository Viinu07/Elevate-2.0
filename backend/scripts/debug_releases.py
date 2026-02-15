
import asyncio
import sys
import os

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.crud.v2.release import release as crud_release
from app.crud.crud_release import release_work_item as crud_work_item
from sqlalchemy import select
from app.models.v2.release import Release
from app.models.release import ReleaseWorkItem

async def debug_data():
    async with AsyncSessionLocal() as db:
        print("--- Fetching V2 Releases ---")
        releases = await crud_release.get_multi(db)
        v2_versions = {r.version: r.id for r in releases}
        for r in releases:
            print(f"V2 Release: {r.version} (ID: {r.id})")

        print("\n--- Fetching V1 Work Items ---")
        # Using simple retrieval if get_multi is available
        stmt = select(ReleaseWorkItem)
        result = await db.execute(stmt)
        work_items = result.scalars().all()
        
        mismatches = []
        for item in work_items:
            # Check if item.release_version exists in v2_versions
            if item.release_version not in v2_versions:
                mismatches.append(f"Item {item.id} ('{item.title}') has version '{item.release_version}' NOT FOUND in V2 Releases")
            else:
                pass
                # print(f"Item {item.id} OK -> {v2_versions[item.release_version]}")

        if mismatches:
            print("\n--- MISMATCHES FOUND ---")
            for m in mismatches:
                print(m)
        else:
            print("\n--- NO MISMATCHES ---")

if __name__ == "__main__":
    import platform
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(debug_data())
