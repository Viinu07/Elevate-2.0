"""
Simple script to check current users and their roles.
Run this to see what users exist in your database.
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from sqlalchemy import select, update
from app.db.session import AsyncSessionLocal
from app.models.user import User

async def check_and_update_users():
    async with AsyncSessionLocal() as db:
        print("\n" + "="*60)
        print("  🔍 USER ROLE CHECKER")
        print("="*60)
        
        # Get all users
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        if not users:
            print("\n❌ No users found in database!")
            print("   Try running the seed script or creating a user first.")
            return
        
        print(f"\n📋 Found {len(users)} user(s):\n")
        
        for i, user in enumerate(users, 1):
            role = user.role or "None"
            is_admin = role.lower() == "admin"
            status = "✅ ADMIN" if is_admin else "👤 Regular"
            
            print(f"{i}. {status} | {user.name}")
            print(f"   ID: {user.id}")
            print(f"   Role: {role}")
            print()
        
        # Check if we have at least one admin
        admin_users = [u for u in users if u.role and u.role.lower() == "admin"]
        
        if admin_users:
            print(f"✅ {len(admin_users)} admin user(s) found!")
            print("   You can use these accounts to test the feedback manager feature.")
        else:
            print("⚠️  No admin users found!")
            if users:
                first_user = users[0]
                print(f"\n   Would you like to make '{first_user.name}' an admin?")
                print(f"   Run: python check_users.py --make-admin {first_user.id}")
        
        print("\n" + "="*60 + "\n")

async def make_admin(user_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"❌ User with ID '{user_id}' not found!")
            return
        
        print(f"\n🔄 Updating '{user.name}' to Admin role...")
        
        user.role = "Admin"
        await db.commit()
        
        print(f"✅ Success! '{user.name}' is now an Admin.")
        print(f"   They can now send feedback to team members.\n")

async def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == "--make-admin" and len(sys.argv) > 2:
            await make_admin(sys.argv[2])
        elif sys.argv[1] in ["--help", "-h"]:
            print("\nUsage:")
            print("  python check_users.py              # List all users")
            print("  python check_users.py --make-admin <user_id>  # Make user an admin")
            print()
        else:
            await check_and_update_users()
    else:
        await check_and_update_users()

if __name__ == "__main__":
    asyncio.run(main())
