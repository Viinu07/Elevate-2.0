
import asyncio
import sys
import os
import uuid
from datetime import datetime

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.crud.v2.release import release as crud_release
from app.models.v2.release import Release, ReleaseStatus
from app.crud.crud_release import release_work_item as crud_work_item
from sqlalchemy import select
from app.models.release import ReleaseWorkItem

async def seed_releases():
    async with AsyncSessionLocal() as db:
        print("--- Checking for Missing V2 Releases ---")
        
        # Get existing V2 versions
        releases = await crud_release.get_multi(db)
        v2_versions = {r.version for r in releases}
        
        # Get V1 Work Items
        stmt = select(ReleaseWorkItem)
        result = await db.execute(stmt)
        work_items = result.scalars().all()
        
        # Identify missing versions
        missing_versions = set()
        for item in work_items:
            if item.release_version and item.release_version not in v2_versions:
                missing_versions.add(item.release_version)
        
        if not missing_versions:
            print("All work item versions exist in V2 Releases. No action needed.")
            return

        print(f"Found {len(missing_versions)} missing versions: {missing_versions}")
        
        # Create missing releases
        for version in missing_versions:
            print(f"Creating V2 Release for version: {version}")
            new_release = Release(
                id=str(uuid.uuid4()),
                version=version,
                name=f"Release {version}",
                status=ReleaseStatus.PLANNING,
                created_at=datetime.utcnow(),
                completion_percentage=0,
                health_score=100
            )
            db.add(new_release)
        
        await db.commit()
        print("Successfully seeded missing releases.")

if __name__ == "__main__":
    import platform
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_releases())
