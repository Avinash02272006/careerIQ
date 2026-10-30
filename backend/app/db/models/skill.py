import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)  # frontend, backend, dsa, ai_ml, soft_skill...
    parent_skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=True)
