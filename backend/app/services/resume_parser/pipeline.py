from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.db.models.resume import Resume
from app.db.models.profile import Profile
from app.db.models.skill import Skill
from app.services.resume_parser.extractor import extract_text_from_file, normalize_extracted_text
from app.services.resume_parser.nlp_pipeline import (
    split_into_sections,
    extract_contact_info,
    extract_candidate_skills,
    parse_education,
    parse_projects,
    parse_experience,
)
from app.services.resume_parser.skill_matcher import normalize_skills
from app.services.resume_parser.quality_scorer import score_resume_quality
from app.services.career_analysis import analyze_career
from app.db.session import SessionLocal


def parse_resume_content(raw_text: str, db: Session) -> Dict[str, Any]:
    """
    Core parsing engine that runs NLP extraction, skill normalization,
    quality scoring, and contact extraction on raw resume text.
    """
    clean_text = normalize_extracted_text(raw_text)
    sections = split_into_sections(clean_text)
    contact_info = extract_contact_info(clean_text)

    # Known skills from DB
    all_known_skills = db.query(Skill).all()
    known_skill_names = [s.name for s in all_known_skills]

    # Candidate skills from skills section + full text
    candidate_tokens = extract_candidate_skills(sections.get("skills", ""), clean_text)
    matched_skills = normalize_skills(candidate_tokens, db, full_text=clean_text)

    education_entries = parse_education(sections.get("education", ""))
    project_entries = parse_projects(sections.get("projects", ""), known_skill_names)
    experience_entries = parse_experience(sections.get("experience", ""), known_skill_names)

    quality_audit = score_resume_quality(sections, clean_text)

    return {
        "raw_text": clean_text,
        "contact_info": contact_info,
        "sections": sections,
        "matched_skills": matched_skills,
        "education": education_entries,
        "projects": project_entries,
        "experience": experience_entries,
        "quality_audit": quality_audit,
    }


def process_resume(resume_id: str, file_path: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Asynchronous or synchronous execution worker for resume file processing.
    Updates Resume, Profile, and triggers Career Analysis.
    """
    db: Session = SessionLocal()
    try:
        raw_text = extract_text_from_file(file_path)
        if not raw_text or len(raw_text.strip()) < 20:
            print(f"Warning: Low text extracted from {file_path}")

        parsed_data = parse_resume_content(raw_text, db)
        quality_score = parsed_data["quality_audit"]["overall_score"]

        # Update Resume record
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.raw_text = raw_text
            resume.quality_score = quality_score
            resume.parsed_at = datetime.utcnow()
            db.add(resume)

        # Update or Create User Profile
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if profile:
            profile.resume_id = resume_id
            profile.education = parsed_data["education"]
            profile.skills = parsed_data["matched_skills"]
            profile.projects = parsed_data["projects"]
            profile.certifications = {
                "raw": parsed_data["sections"].get("certifications", ""),
                "quality_audit": parsed_data["quality_audit"],
            }
            profile.experience = parsed_data["experience"]
            profile.achievements = {
                "contact": parsed_data["contact_info"],
                "suggestions": parsed_data["quality_audit"].get("suggestions", []),
            }
        else:
            profile = Profile(
                user_id=user_id,
                resume_id=resume_id,
                education=parsed_data["education"],
                skills=parsed_data["matched_skills"],
                projects=parsed_data["projects"],
                certifications={
                    "raw": parsed_data["sections"].get("certifications", ""),
                    "quality_audit": parsed_data["quality_audit"],
                },
                experience=parsed_data["experience"],
                achievements={
                    "contact": parsed_data["contact_info"],
                    "suggestions": parsed_data["quality_audit"].get("suggestions", []),
                },
            )
        db.add(profile)
        db.commit()

        # Run career analysis
        analyze_career(user_id, db)
        return parsed_data

    except Exception as e:
        db.rollback()
        print(f"Resume processing failed for {resume_id}: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        db.close()
