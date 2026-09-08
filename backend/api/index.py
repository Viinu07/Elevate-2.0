import sys
import os

# Add the backend root to the Python path so "app.main" resolves correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mangum import Mangum
from app.main import app

# Mangum wraps the FastAPI ASGI app for AWS Lambda / Vercel Serverless
handler = Mangum(app, lifespan="off")
