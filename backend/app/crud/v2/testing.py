from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.v2.testing import TestingCycle, TestExecution, TestCycleStatus
from app.schemas.v2.testing import TestingCycleCreate, TestingCycleUpdate, TestExecutionCreate, TestExecutionUpdate

class CRUDTestingCycle(CRUDBase[TestingCycle, TestingCycleCreate, TestingCycleUpdate]):
    async def get_by_release(self, db: Session, release_id: str) -> List[TestingCycle]:
        stmt = select(TestingCycle).where(TestingCycle.release_id == release_id)
        result = await db.execute(stmt)
        return result.scalars().all()

class CRUDTestExecution(CRUDBase[TestExecution, TestExecutionCreate, TestExecutionUpdate]):
    async def get_by_cycle(self, db: Session, cycle_id: str) -> List[TestExecution]:
        stmt = select(TestExecution).where(TestExecution.cycle_id == cycle_id)
        result = await db.execute(stmt)
        return result.scalars().all()

testing_cycle = CRUDTestingCycle(TestingCycle)
test_execution = CRUDTestExecution(TestExecution)
