
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings
import os
import ssl

# In serverless environments (Vercel), use NullPool since connections can't be persisted
# across invocations. For local dev, use regular connection pooling.
is_serverless = os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")

# Create an SSL context for asyncpg — Supabase requires SSL.
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Pass credentials directly to asyncpg via connect_args to avoid URL parsing
# issues with dots in usernames (e.g. Supabase's "postgres.projectref" format).
# When asyncpg parses a URL, it can misinterpret the dot and truncate the username.
connect_args = {
    "host": settings.POSTGRES_SERVER,
    "port": settings.POSTGRES_PORT,
    "user": settings.POSTGRES_USER,
    "password": settings.POSTGRES_PASSWORD,
    "database": settings.POSTGRES_DB,
    "ssl": ssl_context,
    "statement_cache_size": 0,
    "prepared_statement_cache_size": 0,
    "server_settings": {
        "application_name": settings.PROJECT_NAME,
    },
}

engine_kwargs = {
    "pool_pre_ping": False,
    "echo": False,
    "connect_args": connect_args,
}

if is_serverless:
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs["pool_size"] = settings.POSTGRES_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.POSTGRES_MAX_OVERFLOW

# Use a minimal URL — actual connection params come from connect_args above
engine = create_async_engine(
    "postgresql+asyncpg://",
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)
