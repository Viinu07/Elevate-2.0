
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
    """Test database connection using direct asyncpg (bypasses SQLAlchemy URL parsing)."""
    import traceback
    import asyncpg
    import ssl as ssl_mod

    ssl_ctx = ssl_mod.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl_mod.CERT_NONE

    try:
        # Direct asyncpg connection — no URL parsing, just raw parameters
        conn = await asyncpg.connect(
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database=settings.POSTGRES_DB,
            ssl=ssl_ctx,
        )
        val = await conn.fetchval("SELECT 1")
        await conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "test_query": val,
            "connected_as": settings.POSTGRES_USER,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "error_type": type(e).__name__,
            "connecting_as": settings.POSTGRES_USER,
            "host": settings.POSTGRES_SERVER,
            "port": settings.POSTGRES_PORT,
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
        "DB_URI": settings.SQLALCHEMY_DATABASE_URI,
        "env_POSTGRES_USER": os.environ.get("POSTGRES_USER", "NOT SET"),
    }
