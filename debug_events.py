import requests
import json

def check_events():
    try:
        response = requests.get("http://localhost:8000/api/v2/events", headers={"accept": "application/json"})
        response.raise_for_status()
        events = response.json()
        print(f"Found {len(events)} events.")
        for event in events:
            print(f"Event: {event['name']} (ID: {event['id']})")
            print(f"  has_awards: {event.get('has_awards')}")
            print(f"  voting_required: {event.get('voting_required')}")
            print(f"  award_categories: {event.get('award_categories')}")
            print("-" * 20)
    except Exception as e:
        print(f"Error fetching events: {e}")

if __name__ == "__main__":
    check_events()
