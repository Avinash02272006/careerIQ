import uuid
from sqlalchemy import Column, String, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from app.db.base import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    required_skills = Column(JSONB, nullable=True)  # [{skill, weight, min_level}]
    embedding = Column(Vector(384), nullable=True)
    market_demand_index = Column(Numeric, nullable=True)  # 0-1
