import uuid
from sqlalchemy import Column, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    missing_skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    priority = Column(Numeric, nullable=True)
    estimated_score_gain = Column(Numeric, nullable=True)
