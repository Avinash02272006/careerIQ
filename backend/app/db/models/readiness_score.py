import uuid
from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class ReadinessScore(Base):
    __tablename__ = "readiness_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    score = Column(Numeric, nullable=False)
    breakdown = Column(JSONB, nullable=True)  # {skills:.., projects:.., certs:.., resume_quality:..}
    reasoning = Column(String, nullable=True)
    confidence = Column(Numeric, nullable=True)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
