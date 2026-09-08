
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router as api_router_v1
from app.api.v2.api import api_router as api_router_v2

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router_v1, prefix=settings.API_V1_STR)
if settings.ENABLE_V2_API:
    app.include_router(api_router_v2, prefix=settings.API_V2_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Elevate API"}

@app.get("/health")
async def health():
    """Health check endpoint that tests the database connection."""
    import traceback
    try:
        from app.db.session import AsyncSessionLocal
        from sqlalchemy import text
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            result.scalar()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/debug/config")
async def debug_config():
    """Temporary debug endpoint — shows what env vars are loaded (remove after fixing)."""
    import os
    pw = settings.POSTGRES_PASSWORD
    masked_pw = pw[:2] + "***" + pw[-2:] if len(pw) > 4 else "***"
    return {
        "POSTGRES_SERVER": settings.POSTGRES_SERVER,
        "POSTGRES_USER": settings.POSTGRES_USER,
        "POSTGRES_PASSWORD": masked_pw,
        "POSTGRES_DB": settings.POSTGRES_DB,
        "POSTGRES_PORT": settings.POSTGRES_PORT,
        "FRONTEND_URL": settings.FRONTEND_URL,
        "DB_URI_HOST": str(settings.SQLALCHEMY_DATABASE_URI).split("@")[1].split("/")[0] if "@" in str(settings.SQLALCHEMY_DATABASE_URI) else "unknown",
        "env_POSTGRES_USER": os.environ.get("POSTGRES_USER", "NOT SET"),
        "env_POSTGRES_SERVER": os.environ.get("POSTGRES_SERVER", "NOT SET"),
    }
