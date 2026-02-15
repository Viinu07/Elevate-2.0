"""
Quick script to update a user's role to Admin for testing feedback functionality.

Usage:
    python update_user_role.py <user_id> <role>

Example:
    python update_user_role.py u-1 Admin
"""

import sys
import requests

def update_user_role(user_id: str, role: str):
    """Update a user's role via the API"""
    
    # API base URL (adjust if needed)
    base_url = "http://localhost:8000/api/v1"
    
    try:
        # Update user
        response = requests.put(
            f"{base_url}/users/{user_id}",
            json={"role": role}
        )
        response.raise_for_status()
        
        user = response.json()
        print(f"✅ Successfully updated user '{user['name']}' (ID: {user_id})")
        print(f"   New role: {user.get('role', 'None')}")
        
        return user
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error updating user: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return None

def list_users():
    """List all users"""
    base_url = "http://localhost:8000/api/v1"
    
    try:
        response = requests.get(f"{base_url}/users/")
        response.raise_for_status()
        
        users = response.json()
        print("\n📋 Current Users:")
        print("─" * 60)
        for user in users:
            role = user.get('role', 'None')
            print(f"  • {user['name']} (ID: {user['id']}) - Role: {role}")
        print("─" * 60)
        
        return users
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching users: {e}")
        return []

if __name__ == "__main__":
    print("🔧 User Role Updater for Feedback Testing\n")
    
    # List current users
    users = list_users()
    
    if len(sys.argv) >= 3:
        # Update specific user
        user_id = sys.argv[1]
        role = sys.argv[2]
        print(f"\n🔄 Updating user {user_id} to role '{role}'...")
        update_user_role(user_id, role)
    elif len(sys.argv) == 2 and sys.argv[1] in ['--list', '-l']:
        # Just list users
        pass
    else:
        print("\nTo update a user's role:")
        print("  python update_user_role.py <user_id> <role>")
        print("\nExample:")
        print("  python update_user_role.py u-1 Admin")
        print("\nTo make the first user an admin:")
        if users:
            first_user = users[0]
            print(f"  python update_user_role.py {first_user['id']} Admin")
