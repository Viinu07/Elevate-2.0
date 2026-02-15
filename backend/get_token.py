
import asyncio
import os
import sys
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core import security

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(__file__))

async def main():
    async with AsyncSessionLocal() as session:
        # Get the first user
        result = await session.execute(select(User))
        user = result.scalars().first()
        
        if not user:
            print("No users found in database!")
            return

        print(f"Found User: {user.name} ({user.id})")
        
        # Generate Token
        access_token = security.create_access_token(data={"sub": user.id})
        
        print("\n" + "="*50)
        print("VALID ACCESS TOKEN (Copy this):")
        print("="*50)
        print(access_token)
        print("="*50)
        
        print("\nTo test with curl:")
        print(f'curl -H "Authorization: Bearer {access_token}" https://elevate-2-0-roan.vercel.app/api/v2/auth/me')

if __name__ == "__main__":
    asyncio.run(main())
