import uuid
from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class RoleCompatibility(Base):
    __tablename__ = "role_compatibility"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    compatibility_score = Column(Numeric, nullable=False)
    explanation = Column(String, nullable=True)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
