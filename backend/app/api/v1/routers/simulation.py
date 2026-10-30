import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user_or_guest
from app.db.models.user import User
from app.db.models.profile import Profile
from app.db.models.resume import Resume
from app.db.models.role import Role
from app.db.models.readiness_score import ReadinessScore
from app.db.models.role_compatibility import RoleCompatibility
from app.db.models.simulation import Simulation

router = APIRouter(prefix="/simulation", tags=["simulation"])


class SimulateRequest(BaseModel):
    target_role_id: str
    hypothetical_skills: List[str]


@router.post("/simulate")
def run_career_simulation(
    payload: SimulateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    # 1. Fetch current user profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    resume = db.query(Resume).filter(Resume.id == profile.resume_id).first() if profile else None

    resume_quality = float(resume.quality_score) if (resume and resume.quality_score) else 85.0
    current_skills = profile.skills if profile and profile.skills else []
    current_skill_names = {s.get("name", "").lower() for s in current_skills if s.get("name")}

    # Combine with hypothetical skills
    hypothetical_clean = [s.strip() for s in payload.hypothetical_skills if s.strip()]
    combined_skill_names = set(current_skill_names)
    for s in hypothetical_clean:
        combined_skill_names.add(s.lower())

    # Current readiness
    current_skills_score = min(len(current_skill_names) * 5, 40)
    exp_present = 10 if (profile and profile.experience and len(profile.experience) > 0) else 10
    proj_present = 10 if (profile and profile.projects and len(profile.projects) > 0) else 10
    current_readiness = min((resume_quality * 0.40) + current_skills_score + exp_present + proj_present, 100.0)

    # Projected readiness
    projected_skills_score = min(len(combined_skill_names) * 5, 40)
    projected_readiness = min((resume_quality * 0.40) + projected_skills_score + exp_present + proj_present, 100.0)

    # Target role compatibility
    target_role = None
    try:
        target_role = db.query(Role).filter(Role.id == uuid.UUID(payload.target_role_id)).first()
    except Exception:
        target_role = db.query(Role).filter(Role.title.ilike(f"%{payload.target_role_id}%")).first()

    if not target_role:
        target_role = db.query(Role).first()

    if not target_role:
        raise HTTPException(status_code=404, detail="Target role not found")

    def calc_comp(req_skills, skill_set):
        if not req_skills:
            return 0.0, []
        total_wt = sum(s.get("weight", 1.0) for s in req_skills)
        matched_wt = 0.0
        covered = []
        for req in req_skills:
            req_name = req.get("skill", "")
            wt = req.get("weight", 1.0)
            if req_name.lower() in skill_set:
                matched_wt += wt
                covered.append(req_name)
        comp = (matched_wt / total_wt) * 100.0 if total_wt > 0 else 0.0
        return round(comp, 2), covered

    req_skills = target_role.required_skills or []
    current_comp, current_covered = calc_comp(req_skills, current_skill_names)
    projected_comp, projected_covered = calc_comp(req_skills, combined_skill_names)

    newly_unlocked = [s for s in projected_covered if s not in current_covered]

    # Calculate for other roles as well
    other_roles = db.query(Role).all()
    projected_rankings = []
    for r in other_roles:
        r_req = r.required_skills or []
        c_score, _ = calc_comp(r_req, current_skill_names)
        p_score, _ = calc_comp(r_req, combined_skill_names)
        projected_rankings.append({
            "role_id": str(r.id),
            "title": r.title,
            "current_score": c_score,
            "projected_score": p_score,
            "gain": round(p_score - c_score, 2),
        })

    projected_rankings.sort(key=lambda x: x["projected_score"], reverse=True)

    return {
        "target_role": {
            "id": str(target_role.id),
            "title": target_role.title,
        },
        "current_readiness": round(current_readiness, 2),
        "projected_readiness": round(projected_readiness, 2),
        "readiness_delta": round(projected_readiness - current_readiness, 2),
        "current_compatibility": current_comp,
        "projected_compatibility": projected_comp,
        "compatibility_delta": round(projected_comp - current_comp, 2),
        "newly_unlocked_skills": newly_unlocked,
        "all_roles_projection": projected_rankings,
    }
