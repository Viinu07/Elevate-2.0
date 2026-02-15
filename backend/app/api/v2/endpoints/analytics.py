from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.services import analytics_service

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_metrics(
    db: Session = Depends(deps.get_db)
):
    return await analytics_service.get_dashboard_metrics(db)

@router.get("/velocity")
async def get_velocity_metrics(
    db: Session = Depends(deps.get_db)
):
    return await analytics_service.get_velocity_metrics(db)

@router.get("/trends/releases")
async def get_release_trends(
    db: Session = Depends(deps.get_db)
):
    return await analytics_service.get_release_trends(db)

@router.get("/insights/endorsements")
async def get_endorsement_insights(
    db: Session = Depends(deps.get_db)
):
    return await analytics_service.get_endorsement_insights(db)

@router.get("/heatmap/risk")
async def get_risk_heatmap(
    db: Session = Depends(deps.get_db)
):
    return await analytics_service.get_risk_heatmap(db)
