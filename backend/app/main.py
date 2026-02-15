
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
    # allow_origin_regex='https?://.*', # Reverted to explicit list for better control
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
