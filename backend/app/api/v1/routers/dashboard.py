import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user_or_guest
from app.db.models.user import User
from app.db.models.profile import Profile
from app.db.models.readiness_score import ReadinessScore
from app.db.models.role_compatibility import RoleCompatibility
from app.db.models.role import Role
from app.db.models.skill_gap import SkillGap
from app.db.models.skill import Skill
from app.db.models.learning_plan import LearningPlan

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def compute_domain_radar(user_skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Computes candidate skill coverage score (0-100) across 6 core technical domains
    and provides benchmark comparison values for radar / spider chart visualization.
    """
    domain_categories = {
        "Frontend": ["frontend", "design"],
        "Backend & APIs": ["backend"],
        "Databases & Cache": ["database"],
        "Cloud & DevOps": ["tools"],
        "AI & Machine Learning": ["ai_ml"],
        "DSA & System Design": ["dsa"],
    }

    user_cat_counts = {}
    for s in user_skills:
        cat = s.get("category", "tools")
        user_cat_counts[cat] = user_cat_counts.get(cat, 0) + 1

    radar_data = []
    # Ideal fullstack benchmark counts
    domain_benchmarks = {
        "Frontend": {"target": 85, "max_expected": 5},
        "Backend & APIs": {"target": 90, "max_expected": 5},
        "Databases & Cache": {"target": 80, "max_expected": 4},
        "Cloud & DevOps": {"target": 75, "max_expected": 4},
        "AI & Machine Learning": {"target": 70, "max_expected": 4},
        "DSA & System Design": {"target": 80, "max_expected": 4},
    }

    for domain_name, cats in domain_categories.items():
        matched_count = sum(user_cat_counts.get(c, 0) for c in cats)
        expected = domain_benchmarks[domain_name]["max_expected"]
        target_score = domain_benchmarks[domain_name]["target"]

        candidate_score = min(round((matched_count / expected) * 100), 100) if expected > 0 else 0

        radar_data.append({
            "domain": domain_name,
            "candidateScore": candidate_score,
            "benchmarkScore": target_score,
            "matchedCount": matched_count,
        })

    return radar_data


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    """
    Fetches the user's latest readiness score, domain radar graph metrics,
    and compatibility ratings across all industry benchmark roles.
    """
    # 1. Fetch Profile & Skills
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    user_skills = profile.skills if (profile and profile.skills) else []

    # 2. Fetch Readiness Score
    readiness = db.query(ReadinessScore).filter(ReadinessScore.user_id == current_user.id).first()

    # 3. Fetch All Compatible Roles ordered by score
    compatibilities = (
        db.query(RoleCompatibility, Role)
        .join(Role, RoleCompatibility.role_id == Role.id)
        .filter(RoleCompatibility.user_id == current_user.id)
        .order_by(RoleCompatibility.compatibility_score.desc())
        .all()
    )

    all_roles = []
    for comp, role in compatibilities:
        all_roles.append({
            "role_id": str(role.id),
            "title": role.title,
            "description": role.description,
            "score": float(comp.compatibility_score),
            "market_demand_index": float(role.market_demand_index or 0.8),
            "required_skills": role.required_skills or [],
        })

    # If no compatibility records exist yet, fallback to all roles
    if not all_roles:
        roles_in_db = db.query(Role).all()
        for r in roles_in_db:
            all_roles.append({
                "role_id": str(r.id),
                "title": r.title,
                "description": r.description,
                "score": 65.0,
                "market_demand_index": float(r.market_demand_index or 0.8),
                "required_skills": r.required_skills or [],
            })

    radar_metrics = compute_domain_radar(user_skills)

    ats_audit = None
    if profile and profile.certifications and isinstance(profile.certifications, dict):
        ats_audit = profile.certifications.get("quality_audit")

    contact_info = None
    suggestions = []
    if profile and profile.achievements and isinstance(profile.achievements, dict):
        contact_info = profile.achievements.get("contact")
        suggestions = profile.achievements.get("suggestions", [])

    return {
        "has_data": readiness is not None or profile is not None,
        "readiness_score": float(readiness.score) if readiness else 84.0,
        "breakdown": readiness.breakdown if readiness else {
            "resume_quality": 88.0,
            "skills_score": 35.0,
            "experience_score": 20.0,
            "total_skills": len(user_skills) or 10,
        },
        "reasoning": readiness.reasoning if readiness else None,
        "candidate": {
            "name": (contact_info.get("name") if contact_info else None) or current_user.full_name or "Alex Morgan",
            "email": (contact_info.get("email") if contact_info else None) or current_user.email,
            "phone": contact_info.get("phone") if contact_info else None,
            "github": contact_info.get("github") if contact_info else None,
            "linkedin": contact_info.get("linkedin") if contact_info else None,
        },
        "skills": user_skills,
        "radar_metrics": radar_metrics,
        "top_roles": all_roles[:3],
        "all_roles": all_roles,
        "ats_audit": ats_audit,
        "suggestions": suggestions,
        "experience": profile.experience if profile else [],
        "projects": profile.projects if profile else [],
        "education": profile.education if profile else [],
    }


@router.get("/gaps/{role_id}")
def get_role_gaps_and_plan(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    """
    Fetches missing skills (gaps) and learning roadmap for a specific target role.
    """
    # 1. Verify Role exists (support string uuid or title fallback)
    try:
        role_uuid = uuid.UUID(role_id)
        role = db.query(Role).filter(Role.id == role_uuid).first()
    except ValueError:
        role = db.query(Role).filter(Role.title.ilike(f"%{role_id}%")).first()

    if not role:
        # Fallback to first role
        role = db.query(Role).first()

    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # 2. Fetch gaps for this user and role
    gaps = (
        db.query(SkillGap, Skill)
        .join(Skill, SkillGap.missing_skill_id == Skill.id)
        .filter(SkillGap.user_id == current_user.id, SkillGap.role_id == role.id)
        .order_by(SkillGap.priority.desc())
        .all()
    )

    gap_details = []
    for gap, skill in gaps:
        gap_details.append({
            "skill_name": skill.name,
            "category": skill.category,
            "priority": float(gap.priority) if gap.priority else 0.0,
            "estimated_score_gain": float(gap.estimated_score_gain) if gap.estimated_score_gain else 0.0,
        })

    # 3. Fetch Learning Plan
    plan_entry = (
        db.query(LearningPlan)
        .filter(LearningPlan.user_id == current_user.id, LearningPlan.role_id == role.id)
        .first()
    )

    # If no dynamic plan found, build one from required skills
    weekly_plan = plan_entry.plan if plan_entry else []
    if not weekly_plan and gap_details:
        for idx, g in enumerate(gap_details[:4]):
            weekly_plan.append({
                "week": idx + 1,
                "skill": g["skill_name"],
                "topic": f"Mastery of {g['skill_name']} Architecture & Patterns",
                "resource": f"Official documentation & tutorials for {g['skill_name']}",
                "tasks": [
                    f"Read core fundamentals and best practices for {g['skill_name']}",
                    f"Build a mini project module implementing {g['skill_name']}",
                ],
            })

    return {
        "role_id": str(role.id),
        "role_title": role.title,
        "description": role.description,
        "gaps": gap_details,
        "learning_plan": weekly_plan,
        "required_skills": role.required_skills or [],
    }
