from fastapi import FastAPI
import sys
# Add backend directory to Python path
import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Debug: Print current directory and sys.path
print(f"Current working directory: {os.getcwd()}")
print(f"Directory of script: {os.path.dirname(__file__)}")

# In Vercel, the root is the task root.
# We try to add both the project root (..) and the backend directory path.
sys.path.append(os.path.join(os.path.dirname(__file__), '..')) # Project root
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend')) # Backend dir

# Import the FastAPI app
try:
    # Try importing from 'backend.app.main' (if project root is in path)
    from backend.app.main import app as _app
    app = _app
except Exception as e1:
    print(f"Failed to import from backend.app.main: {e1}")
    try:
        # Try importing from 'app.main' (if backend dir is in path)
        from app.main import app as _app
        app = _app
    except Exception as e2:
        print(f"Failed to import from app.main: {e2}")
        
        # FALLBACK APP - To display the error in the browser!
        app = FastAPI()
        
        @app.get("/{path:path}")
        async def catch_all(path: str):
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error", 
                    "message": "Failed to initialize backend application", 
                    "details": {
                        "error_1": str(e1),
                        "error_2": str(e2),
                        "sys_path": sys.path,
                        "cwd": os.getcwd(),
                        "files_in_backend": os.listdir(os.path.join(os.path.dirname(__file__), '../backend')) if os.path.exists(os.path.join(os.path.dirname(__file__), '../backend')) else "backend dir not found"
                    }
                }
            )

# Vercel needs the app instance
# Note: In Vercel, the file is treated as a module, so exposing 'app' is enough.

# Vercel needs the app instance
# Note: In Vercel, the file is treated as a module, so exposing 'app' is enough.
