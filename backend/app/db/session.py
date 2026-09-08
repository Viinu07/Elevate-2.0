
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
import os

# In serverless environments (Vercel), use NullPool since connections can't be persisted
# across invocations. For local dev, use regular connection pooling.
is_serverless = os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")

engine_kwargs = {
    "pool_pre_ping": False,
    "echo": False,
    "connect_args": {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "server_settings": {
            "application_name": settings.PROJECT_NAME,
        },
        # Supabase/Cloud DBs require SSL.
        # For local dev, this might fail if DB doesn't support SSL, so we might make it conditional later.
        # But for Vercel -> Supabase, it is REQUIRED.
        "ssl": "require",
    }
}

if is_serverless:
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs["pool_size"] = settings.POSTGRES_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.POSTGRES_MAX_OVERFLOW

engine = create_async_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)
