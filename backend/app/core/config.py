
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, computed_field
from pydantic_core import MultiHostUrl

class Settings(BaseSettings):
    PROJECT_NAME: str = "Elevate API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "https://elevate-frontend-3ts5.onrender.com",
        "https://elevate-frontend.fly.dev",
        "https://elevate-2-0-roan.vercel.app",
        "https://elevate-2-0.vercel.app",
        "https://elevate-2-0-git-main-viinu07.vercel.app"
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
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return MultiHostUrl.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
