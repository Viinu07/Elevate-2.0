from sqlalchemy.orm import Session
from app.crud.v2 import testing as crud_testing
from app.schemas.v2 import testing as schemas
from app.models.v2.testing import TestingCycle, TestExecution
import uuid

async def create_testing_cycle(db: Session, cycle_in: schemas.TestingCycleCreate) -> TestingCycle:
    cycle_data = cycle_in.model_dump()
    cycle_data["id"] = str(uuid.uuid4())
    
    db_obj = TestingCycle(**cycle_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

async def get_release_cycles(db: Session, release_id: str) -> list[TestingCycle]:
    return await crud_testing.testing_cycle.get_by_release(db, release_id)

async def create_test_execution(db: Session, execution_in: schemas.TestExecutionCreate, user_id: str) -> TestExecution:
    execution_data = execution_in.model_dump()
    execution_data["id"] = str(uuid.uuid4())
    execution_data["executed_by_id"] = user_id
    
    db_obj = TestExecution(**execution_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Trigger metric update (async in real world)
    # await update_cycle_pass_rate(db, execution_in.cycle_id)
    
    return db_obj

async def get_cycle_executions(db: Session, cycle_id: str) -> list[TestExecution]:
    return await crud_testing.test_execution.get_by_cycle(db, cycle_id)
