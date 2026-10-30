import uuid
from sqlalchemy.orm import Session
from app.db.models.profile import Profile
from app.db.models.resume import Resume
from app.db.models.role import Role
from app.db.models.skill import Skill
from app.db.models.readiness_score import ReadinessScore
from app.db.models.role_compatibility import RoleCompatibility
from app.db.models.skill_gap import SkillGap
from app.db.models.learning_plan import LearningPlan


def analyze_career(user_id: str, db: Session):
    """
    Analyzes a user's parsed profile to calculate:
    1. Readiness Score
    2. Role Compatibility
    3. Skill Gaps
    4. Learning Plans
    """
    # 1. Fetch user profile and resume
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        print(f"No profile found for user {user_id}. Skipping career analysis.")
        return

    resume = db.query(Resume).filter(Resume.id == profile.resume_id).first()
    resume_quality = float(resume.quality_score) if (resume and resume.quality_score) else 60.0

    # ---------- CALCULATE READINESS SCORE ----------
    # Score details breakdown:
    # - Resume Quality (40 points)
    # - Skill Count: 5 points per skill up to 8 skills (40 points)
    # - Experience & Projects: presence of entries (20 points)
    user_skills = profile.skills or []
    skills_count = len(user_skills)
    skills_score = min(skills_count * 5, 40)

    exp_present = 10 if (profile.experience and len(profile.experience) > 0) else 0
    proj_present = 10 if (profile.projects and len(profile.projects) > 0) else 0
    experience_score = exp_present + proj_present

    total_readiness = min((resume_quality * 0.40) + skills_score + experience_score, 100.0)
    total_readiness = round(total_readiness, 2)

    breakdown = {
        "resume_quality": round(resume_quality, 2),
        "skills_score": skills_score,
        "experience_score": experience_score,
        "total_skills": skills_count
    }

    # Save Readiness Score
    readiness_score_entry = db.query(ReadinessScore).filter(ReadinessScore.user_id == user_id).first()
    if readiness_score_entry:
        readiness_score_entry.score = total_readiness
        readiness_score_entry.breakdown = breakdown
        readiness_score_entry.reasoning = f"Based on {skills_count} matching technical skills and a resume score of {resume_quality}."
        readiness_score_entry.confidence = 0.90
    else:
        readiness_score_entry = ReadinessScore(
            id=uuid.uuid4(),
            user_id=user_id,
            score=total_readiness,
            breakdown=breakdown,
            reasoning=f"Based on {skills_count} matching technical skills and a resume score of {resume_quality}.",
            confidence=0.90
        )
        db.add(readiness_score_entry)

    # ---------- CALCULATE ROLE COMPATIBILITY & GAPS ----------
    roles = db.query(Role).all()
    user_skill_names = {s.get("name").lower() for s in user_skills if s.get("name")}
    
    # Pre-load skills to resolve IDs
    all_skills = db.query(Skill).all()
    skill_name_to_id = {s.name.lower(): s.id for s in all_skills}

    # Clear existing compatibility entries and gaps to rebuild
    db.query(RoleCompatibility).filter(RoleCompatibility.user_id == user_id).delete()
    db.query(SkillGap).filter(SkillGap.user_id == user_id).delete()
    db.query(LearningPlan).filter(LearningPlan.user_id == user_id).delete()

    for role in roles:
        required_skills = role.required_skills or []  # [{"skill": name, "weight": weight, "min_level": val}]
        if not required_skills:
            continue

        total_weight = sum(s.get("weight", 1.0) for s in required_skills)
        matched_weight = 0.0
        missing_skills = []

        for req in required_skills:
            req_name = req.get("skill")
            req_weight = req.get("weight", 1.0)
            
            if req_name.lower() in user_skill_names:
                matched_weight += req_weight
            else:
                missing_skills.append(req)

        compatibility_percentage = (matched_weight / total_weight) * 100 if total_weight > 0 else 0.0
        compatibility_percentage = round(compatibility_percentage, 2)

        # Save Role Compatibility
        compat_entry = RoleCompatibility(
            id=uuid.uuid4(),
            user_id=user_id,
            role_id=role.id,
            compatibility_score=compatibility_percentage,
            explanation=f"You match {len(required_skills) - len(missing_skills)} out of {len(required_skills)} required skills for this role."
        )
        db.add(compat_entry)

        # Save Skill Gaps & Mock Weekly Learning Plan
        weekly_plan = []
        for index, req in enumerate(missing_skills):
            req_name = req.get("skill")
            skill_id = skill_name_to_id.get(req_name.lower())
            
            if skill_id:
                # Add gap
                gap_entry = SkillGap(
                    id=uuid.uuid4(),
                    user_id=user_id,
                    role_id=role.id,
                    missing_skill_id=skill_id,
                    priority=round(req.get("weight", 1.0) * 10, 2),
                    estimated_score_gain=round(req.get("weight", 1.0) * 5, 2)
                )
                db.add(gap_entry)

                # Add to Learning Plan timeline
                weekly_plan.append({
                    "week": index + 1,
                    "skill": req_name,
                    "topic": f"Mastery of {req_name} Fundamentals",
                    "resource": f"FreeCodeCamp / Official documentation for {req_name}",
                    "tasks": [
                        f"Read core guides for {req_name}",
                        f"Complete 2 mini-projects using {req_name}"
                    ]
                })

        # Save Learning Plan for the role (only if they have missing skills)
        if weekly_plan:
            plan_entry = LearningPlan(
                id=uuid.uuid4(),
                user_id=user_id,
                role_id=role.id,
                plan=weekly_plan
            )
            db.add(plan_entry)

    db.commit()
    print(f"Completed career analysis for user {user_id}.")
