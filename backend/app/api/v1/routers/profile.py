from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user_or_guest
from app.db.models.user import User
from app.db.models.profile import Profile
from app.db.models.resume import Resume
from app.services.career_analysis import analyze_career

router = APIRouter(prefix="/profile", tags=["profile"])


class UpdateSkillsRequest(BaseModel):
    skills: List[str]


@router.get("/me")
def get_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        return {
            "has_profile": False,
            "user": {
                "id": str(current_user.id),
                "full_name": current_user.full_name or "Alex Morgan",
                "email": current_user.email,
            },
            "profile": None,
        }

    resume = db.query(Resume).filter(Resume.id == profile.resume_id).first() if profile.resume_id else None

    return {
        "has_profile": True,
        "user": {
            "id": str(current_user.id),
            "full_name": current_user.full_name or "Alex Morgan",
            "email": current_user.email,
        },
        "resume": {
            "id": str(resume.id) if resume else None,
            "quality_score": float(resume.quality_score) if resume and resume.quality_score is not None else 85.0,
            "parsed_at": resume.parsed_at.isoformat() if resume and resume.parsed_at else None,
        },
        "profile": {
            "skills": profile.skills or [],
            "experience": profile.experience or [],
            "projects": profile.projects or [],
            "education": profile.education or [],
            "certifications": profile.certifications or {},
            "achievements": profile.achievements or {},
        },
    }


@router.post("/skills/update")
def update_profile_skills(
    payload: UpdateSkillsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.id,
            skills=[{"name": s, "category": "tools", "confidence": 1.0} for s in payload.skills],
        )
        db.add(profile)
    else:
        profile.skills = [{"name": s, "category": "tools", "confidence": 1.0} for s in payload.skills]

    db.commit()
    # Re-run career analysis
    analyze_career(str(current_user.id), db)

    return {"status": "success", "skills_count": len(payload.skills)}
