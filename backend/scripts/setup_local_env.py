import os
import sys
try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    psycopg2 = None
import subprocess

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def setup_local_db():
    # Connection params for default postgres installation
    params = {
        "user": "postgres",
        "password": "postgres",
        "host": "localhost",
        "port": "5432",
        "database": "postgres" # Connect to default DB first
    }
    
    target_db = "Elevate"

    try:
        if psycopg2 is None:
            print("Error: 'psycopg2' module is missing.")
            print("This script requires 'psycopg2' to create the database.")
            print("Please install it manually if you need to run this setup: pip install psycopg2-binary")
            return

        print(f"Connecting to PostgreSQL at {params['host']}...")
        conn = psycopg2.connect(**params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if DB exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{target_db}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Database '{target_db}' not found. Creating...")
            cursor.execute(f"CREATE DATABASE {target_db}")
            print(f"Database '{target_db}' created successfully.")
        else:
            print(f"Database '{target_db}' already exists.")
            
        cursor.close()
        conn.close()
        
        # Run Migrations
        print("Running Alembic Migrations...")
        # We need to run this from the backend directory
        backend_dir = os.path.join(os.path.dirname(__file__), '..')
        
        # Ensure we use the right command for windows
        cmd = ["alembic", "upgrade", "head"]
        if sys.platform == "win32":
             # On windows, we might need to call it via python module if alembic.exe isn't in path nicely, 
             # but usually 'alembic' works if env is active. Let's try module approach to be safe.
             cmd = [sys.executable, "-m", "alembic", "upgrade", "head"]

        result = subprocess.run(cmd, cwd=backend_dir, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Migrations applied successfully!")
            print(result.stdout)
        else:
            print("Error applying migrations:")
            print(result.stderr)
            
    except Exception as e:
        print(f"Setup failed: {e}")
        print("Please ensure PostgreSQL is running locally on port 5432 with user/pass: postgres/postgres")

if __name__ == "__main__":
    setup_local_db()
