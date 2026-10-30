import uuid
from sqlalchemy import Column, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    hypothetical_skills = Column(JSONB, nullable=True)
    projected_score = Column(Numeric, nullable=True)
    projected_compatibility = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
