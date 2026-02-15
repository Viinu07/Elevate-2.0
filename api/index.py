from fastapi import FastAPI
import sys
import os

# Add backend directory to Python path
import sys
import os

# Debug: Print current directory and sys.path
print(f"Current working directory: {os.getcwd()}")
print(f"Directory of script: {os.path.dirname(__file__)}")
print(f"Initial sys.path: {sys.path}")

# In Vercel, the root is the task root, but we need to ensure we can find 'backend'
backend_path = os.path.join(os.path.dirname(__file__), '../backend')
sys.path.append(backend_path)
sys.path.append(os.path.join(os.getcwd(), 'backend')) # Fallback/Alternative for Vercel
app_dir = os.path.join(os.path.dirname(__file__), '../backend')
if os.path.isdir(app_dir):
    sys.path.append(app_dir)

print(f"Updated sys.path: {sys.path}")

# Import the FastAPI app
try:
    from app.main import app
except ImportError as e:
    print(f"Error importing app.main: {e}")
    # Try adding just 'backend' to path if 'app' is top-level there
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    try:
        from backend.app.main import app
    except ImportError as e2:
        print(f"Error importing backend.app.main: {e2}")
        raise e

# Vercel needs the app instance
# Note: In Vercel, the file is treated as a module, so exposing 'app' is enough.
