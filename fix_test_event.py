import psycopg2

try:
    conn = psycopg2.connect(
        host="127.0.0.1",
        database="Elevate",
        user="postgres",
        password="postgres",
        port="5432"
    )
    cur = conn.cursor()
    
    event_id = '5fec03fa-a92b-4df4-8938-f1311bf0f2b7'
    print(f"Updating event {event_id} to enable voting...")
    
    cur.execute("UPDATE event SET voting_required = true WHERE id = %s;", (event_id,))
    conn.commit()
    
    print("Update successful.")
    
    cur.execute("SELECT id, name, voting_required FROM event WHERE id = %s;", (event_id,))
    updated_event = cur.fetchone()
    print(f"Verified Event: {updated_event}")

    cur.close()
    conn.close()

except Exception as e:
    print(f"Database error: {e}")
