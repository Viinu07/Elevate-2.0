
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
from sqlalchemy import URL

class Settings(BaseSettings):
    PROJECT_NAME: str = "Elevate API"
    API_V1_STR: str = "/api/v1"
    
    # CORS — In production on Vercel, allow all origins since Vercel generates
    # unique preview URLs per deployment. Set FRONTEND_URL to your primary domain.
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
    ]

    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432
    
    POSTGRES_POOL_SIZE: int = 20
    POSTGRES_MAX_OVERFLOW: int = 10

    # V2 API Feature Flags
    API_V2_STR: str = "/api/v2"
    ENABLE_V2_API: bool = True
    ENABLE_ENHANCED_EVENTS: bool = True
    ENABLE_ENDORSEMENTS: bool = True

    SECRET_KEY: str = "dev_secret_key_change_in_production"


    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Build the database URI using SQLAlchemy's URL.create which properly
        URL-encodes special characters in usernames (e.g. dots in Supabase's
        'postgres.projectref' format)."""
        return str(URL.create(
            drivername="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            database=self.POSTGRES_DB,
        ))

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

_settings = Settings()

# Dynamically add FRONTEND_URL to CORS origins if not already present
if _settings.FRONTEND_URL and _settings.FRONTEND_URL not in _settings.BACKEND_CORS_ORIGINS:
    _settings.BACKEND_CORS_ORIGINS.append(_settings.FRONTEND_URL)

settings = _settings
