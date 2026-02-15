from fastapi import FastAPI
import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

# Import the FastAPI app
from app.main import app

# Vercel needs the app instance
# Note: In Vercel, the file is treated as a module, so exposing 'app' is enough.
