import requests
import json
import datetime

BASE_URL = "http://localhost:8000"

def run_verification():
    print("Starting Event Awards Verification...")

    # 1. Login to get token (assuming verify_awards_feature.py will be run where we can access the server)
    # Since I don't have the exact login credentials or flow for the running server easily without user interaction or knowing the exact auth state, 
    # I will try to use the admin user I might have created before or just try to create a user if needed.
    # actually, looking at the history, there was a "setting_up_admin_user_for_testing" log.
    # Let's try to login as admin@example.com / password123 as referenced in the browser task.
    
    auth_token = None
    user_id = None
    user_name = None
    
    # 1. Fetch Users to get a valid user_id
    try:
        print("Fetching users...")
        users_resp = requests.get(f"{BASE_URL}/api/v1/users/")
        if users_resp.status_code != 200:
            print(f"❌ Failed to fetch users: {users_resp.status_code}")
            return
        
        users = users_resp.json()
        if not users:
            print("❌ No users found in the system.")
            return
            
        # Pick the first user to act as organizer/giver
        user = users[0]
        user_id = user["id"]
        user_name = user["name"]
        print(f"Using user: {user_name} ({user_id})")
        
    except Exception as e:
        print(f"❌ Could not connect to server: {e}")
        return

    # 2. Login as this user
    try:
        # Using v2 auth login-as endpoint
        login_resp = requests.post(f"{BASE_URL}/api/v2/auth/login-as", json={"user_id": user_id})
        if login_resp.status_code == 200:
            auth_token = login_resp.json()["access_token"]
            print("✅ Login successful")
        else:
            print(f"❌ Login failed: {login_resp.status_code} - {login_resp.text}")
            return
    except Exception as e:
        print(f"❌ Login Error: {e}")
        return

    headers = {"Authorization": f"Bearer {auth_token}"}

    # 3. Create an Event with Awards
    print("\nCreating Event with Awards...")
    event_data = {
        "name": "Awards Verification Event",
        "date_time": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat(),
        "meeting_link": "http://zoom.us/test",
        "event_type": "Online",
        "agenda": "Testing awards",
        "has_awards": True,
        "award_categories": "Best Speaker, Most Helpful",
        "organizer_id": user_id
    }

    create_resp = requests.post(f"{BASE_URL}/api/v2/events", json=event_data, headers=headers)
    if create_resp.status_code not in [200, 201]:
        print(f"❌ Failed to create event: {create_resp.status_code} - {create_resp.text}")
        return
    
    event = create_resp.json()
    event_id = event["id"]
    print(f"✅ Event created: {event_id}")

    # 4. Verify Event Details has Awards fields
    print("\nVerifying Event Details...")
    get_resp = requests.get(f"{BASE_URL}/api/v2/events/{event_id}", headers=headers)
    event_details = get_resp.json()
    
    if event_details.get("has_awards") is True:
        print("✅ has_awards is True")
    else:
        print(f"❌ has_awards is {event_details.get('has_awards')}")

    if event_details.get("award_categories") == "Best Speaker, Most Helpful":
        print("✅ award_categories matches")
    else:
        print(f"❌ award_categories mismatch: {event_details.get('award_categories')}")

    # 5. Grant an Award (Create Endorsement)
    # We will grant to self (user_id) for simplicity as we know this ID exists
    receiver_id = user_id
    print(f"\nGranting award to user {receiver_id}...")

    endorsement_data = {
        "event_id": event_id,
        "category": "Best Speaker",
        "receiver_id": receiver_id,
        "message": "You were great!"
    }

    endorsement_resp = requests.post(f"{BASE_URL}/api/v2/endorsements", json=endorsement_data, headers=headers)
    
    if endorsement_resp.status_code in [200, 201]:
        print("✅ Award granted successfully")
    else:
        print(f"❌ Failed to grant award: {endorsement_resp.status_code} - {endorsement_resp.text}")
        return

    # 6. Verify Award appears in Event Details
    print("\nVerifying Award in Event Details...")
    get_resp_2 = requests.get(f"{BASE_URL}/api/v2/events/{event_id}", headers=headers)
    event_details_2 = get_resp_2.json()
    
    endorsements = event_details_2.get("endorsements", [])
    found = False
    for end in endorsements:
        # Check category and giver_name (EndorsementSummary)
        if end["category"] == "Best Speaker" and end["giver_name"] == user_name:
             found = True
             break
    
    if found:
        print("✅ Award found in event details")
    else:
        print("❌ Award NOT found in event details")
        print(json.dumps(endorsements, indent=2))

if __name__ == "__main__":
    run_verification()
