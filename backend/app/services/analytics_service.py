from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.models.v2.release import Release, ReleaseStatus
from app.models.v2.testing import TestingCycle
from app.models.v2.work_item import WorkItem, WorkItemStatus
from datetime import datetime, timedelta

async def get_dashboard_metrics(db: Session):
    # 1. Active Releases Health
    stmt = select(Release).filter(
        Release.status.in_([ReleaseStatus.PLANNING, ReleaseStatus.DEVELOPMENT, ReleaseStatus.TESTING])
    )
    result = await db.execute(stmt)
    active_releases = result.scalars().all()
    
    avg_health = 0
    if active_releases:
        avg_health = sum(r.health_score for r in active_releases) / len(active_releases)
        
    # 2. Overall Testing Pass Rate (Last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    stmt = select(TestingCycle).filter(TestingCycle.created_at >= thirty_days_ago)
    result = await db.execute(stmt)
    recent_cycles = result.scalars().all()
    
    avg_pass_rate = 0
    if recent_cycles:
        avg_pass_rate = sum(c.pass_rate for c in recent_cycles) / len(recent_cycles)
        
    # 3. Work Items Completed (This Month)
    first_of_month = datetime.utcnow().replace(day=1)
    stmt = select(func.count(WorkItem.id)).filter(
        WorkItem.status == WorkItemStatus.DONE,
        WorkItem.created_at >= first_of_month
    )
    result = await db.execute(stmt)
    completed_items = result.scalar() or 0
    
    return {
        "active_releases_count": len(active_releases),
        "average_release_health": round(avg_health, 1),
        "testing_pass_rate": round(avg_pass_rate, 1),
        "items_completed_this_month": completed_items
    }

async def get_velocity_metrics(db: Session):
    # Mock velocity data for the last 4 sprints (weeks)
    # In a real app, we'd group WorkItems by closed date
    return [
        {"period": "Week 1", "points": 24},
        {"period": "Week 2", "points": 32},
        {"period": "Week 3", "points": 28},
        {"period": "Current", "points": 15}, # In progress
    ]

async def get_release_trends(db: Session, months: int = 3):
    # Mock trend data - in reality would aggregate from Release table
    return [
        {"month": "Jan", "success_rate": 95, "avg_health": 88},
        {"month": "Feb", "success_rate": 88, "avg_health": 82},
        {"month": "Mar", "success_rate": 92, "avg_health": 90},
    ]

async def get_endorsement_insights(db: Session):
    # Mock cultural values data
    return [
        {"value": "Team Player", "count": 45},
        {"value": "Innovation", "count": 30},
        {"value": "Customer Obsession", "count": 25},
        {"value": "Ownership", "count": 35},
    ]

async def get_risk_heatmap(db: Session):
    # Mock risk data
    return [
        {"component": "Auth Service", "risk_score": 12, "defect_count": 3},
        {"component": "Payment Gateway", "risk_score": 85, "defect_count": 15}, # High risk
        {"component": "User Profile", "risk_score": 5, "defect_count": 1},
        {"component": "Notification Engine", "risk_score": 45, "defect_count": 8},
    ]
