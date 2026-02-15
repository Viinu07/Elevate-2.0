from sqlalchemy import String, ForeignKey, DateTime, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.base_class import Base
import uuid
import enum

class TestCycleStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ABORTED = "ABORTED"

class TestExecutionStatus(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    BLOCKED = "BLOCKED"
    SKIPPED = "SKIPPED"
    PENDING = "PENDING"

class TestingCycle(Base):
    __tablename__ = "testing_cycles"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    release_id: Mapped[str] = mapped_column(ForeignKey("releases_v2.id"), index=True)
    name: Mapped[str] = mapped_column(String) # e.g. "SIT Cycle 1"
    status: Mapped[TestCycleStatus] = mapped_column(String, default=TestCycleStatus.PLANNED)
    
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Metrics
    pass_rate: Mapped[float] = mapped_column(Integer, default=0) # Percentage
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    release: Mapped["Release"] = relationship("Release")
    # executions: Mapped[list["TestExecution"]] = relationship("TestExecution", back_populates="cycle")

class TestExecution(Base):
    __tablename__ = "test_executions"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    cycle_id: Mapped[str] = mapped_column(ForeignKey("testing_cycles.id"), index=True)
    
    title: Mapped[str] = mapped_column(String)
    status: Mapped[TestExecutionStatus] = mapped_column(String, default=TestExecutionStatus.PENDING)
    
    executed_by_id: Mapped[str] = mapped_column(ForeignKey("user.id"), nullable=True)
    executed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    comments: Mapped[str] = mapped_column(String, nullable=True)
    defect_id: Mapped[str] = mapped_column(String, nullable=True) # Link to external defect or internal bug WorkItem
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cycle: Mapped["TestingCycle"] = relationship("TestingCycle") # back_populates="executions"
    executed_by: Mapped["User"] = relationship("User")
