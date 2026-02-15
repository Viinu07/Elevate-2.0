from fastapi import FastAPI
import sys
import os

# Add backend directory to Python path
# In Vercel, the root is the task root, but we need to ensure we can find 'backend'
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
sys.path.append(os.path.join(os.getcwd(), 'backend')) # Fallback/Alternative for Vercel
app_dir = os.path.join(os.path.dirname(__file__), '../backend')
if os.path.isdir(app_dir):
    sys.path.append(app_dir)

# Import the FastAPI app
from app.main import app

# Vercel needs the app instance
# Note: In Vercel, the file is treated as a module, so exposing 'app' is enough.
