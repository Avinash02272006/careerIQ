from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List, Dict, Any


class ResumeUploadResponse(BaseModel):
    resume_id: UUID
    status: str
    quality_score: Optional[float] = None
    extracted_data: Optional[Dict[str, Any]] = None


class ResumeStatusResponse(BaseModel):
    resume_id: UUID
    status: str  # "processing" | "done" | "failed"
    quality_score: Optional[float] = None
    extracted_data: Optional[Dict[str, Any]] = None


class ParseTextRequest(BaseModel):
    text: str
    candidate_name: Optional[str] = None
