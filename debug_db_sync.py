import psycopg2
import os

try:
    conn = psycopg2.connect(
        host="127.0.0.1",
        database="Elevate",
        user="postgres",
        password="postgres",
        port="5432"
    )
    cur = conn.cursor()
    
    print("Checking 'event' table structure (columns):")
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'event';")
    columns = cur.fetchall()
    for col in columns:
        print(f"  {col[0]} ({col[1]})")

    print("\nChecking latest 5 events:")
    cur.execute("SELECT id, name, has_awards, voting_required, award_categories FROM event ORDER BY created_at DESC LIMIT 5;")
    events = cur.fetchall()
    if not events:
        print("No events found.")
    for event in events:
        print(f"ID: {event[0]}")
        print(f"Name: {event[1]}")
        print(f"has_awards: {event[2]}")
        print(f"voting_required: {event[3]}")
        print(f"award_categories: {event[4]}")
        print("-" * 20)

    cur.close()
    conn.close()

except Exception as e:
    print(f"Database error: {e}")
