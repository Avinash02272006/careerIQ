import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user_or_guest
from app.db.models.user import User

router = APIRouter(prefix="/jobs", tags=["jobs"])

# Curated high-caliber job listings dataset
JOB_CATALOG = [
    {
        "id": "job-101",
        "title": "Senior Full Stack Engineer",
        "company": "Stripe",
        "location": "San Francisco, CA (Remote / Hybrid)",
        "role_category": "fullstack",
        "role_id": "role-fs",
        "salary_range": "$165,000 - $210,000",
        "experience_level": "Senior (4+ YOE)",
        "workplace_type": "Hybrid",
        "posted_days_ago": 2,
        "description": "Build world-class developer billing tools, reactive merchant dashboards, and high-throughput transactional APIs with React, Node.js, and PostgreSQL.",
        "required_skills": ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "REST APIs", "Docker", "Git"],
        "preferred_skills": ["Redis", "AWS", "Microservices"],
        "benefits": ["Equity grants", "Health/Dental 100%", "Home office budget", "Unlimited PTO"],
        "department": "Core Infrastructure"
    },
    {
        "id": "job-102",
        "title": "Full Stack Platform Developer",
        "company": "Vercel",
        "location": "Remote (US & Global)",
        "role_category": "fullstack",
        "role_id": "role-fs",
        "salary_range": "$150,000 - $190,000",
        "experience_level": "Mid-Senior (3+ YOE)",
        "workplace_type": "Remote",
        "posted_days_ago": 1,
        "description": "Join our team engineering next-generation deployment dashboards, edge middleware integrations, and reactive web applications.",
        "required_skills": ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs", "Git"],
        "preferred_skills": ["Three.js", "PostgreSQL", "Docker"],
        "benefits": ["Remote work stipend", "Annual company retreats", "Learning budget"],
        "department": "Developer Experience"
    },
    {
        "id": "job-103",
        "title": "Frontend Architect / Senior UI Engineer",
        "company": "Figma",
        "location": "San Francisco, CA / Remote",
        "role_category": "frontend",
        "role_id": "role-fe",
        "salary_range": "$170,000 - $225,000",
        "experience_level": "Senior (5+ YOE)",
        "workplace_type": "Remote",
        "posted_days_ago": 3,
        "description": "Develop high-performance browser canvas experiences, custom web components, and fluid layout design tools in React and TypeScript.",
        "required_skills": ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Git"],
        "preferred_skills": ["Three.js", "WebGL", "Figma", "Design Systems"],
        "benefits": ["Comprehensive medical", "401(k) match", "Parental leave"],
        "department": "Design Systems & Editor"
    },
    {
        "id": "job-104",
        "title": "Backend Microservices Engineer",
        "company": "Datadog",
        "location": "New York, NY (Hybrid)",
        "role_category": "backend",
        "role_id": "role-be",
        "salary_range": "$160,000 - $205,000",
        "experience_level": "Mid-Senior (3+ YOE)",
        "workplace_type": "Hybrid",
        "posted_days_ago": 4,
        "description": "Design and scale low-latency telemetry pipelines, REST & gRPC microservices, distributed cache layers, and relational storage engines.",
        "required_skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "REST APIs", "Redis", "Microservices"],
        "preferred_skills": ["Kubernetes", "AWS", "Kafka", "Data Structures"],
        "benefits": ["Commuter benefits", "Wellness subsidy", "Competitive equity"],
        "department": "Distributed Systems"
    },
    {
        "id": "job-105",
        "title": "DevOps & Cloud Infrastructure Specialist",
        "company": "HashiCorp",
        "location": "Remote (Worldwide)",
        "role_category": "systems",
        "role_id": "role-devops",
        "salary_range": "$155,000 - $195,000",
        "experience_level": "Mid-Senior (3+ YOE)",
        "workplace_type": "Remote",
        "posted_days_ago": 5,
        "description": "Automate multi-region AWS/GCP infrastructure with Terraform, build immutable container pipelines, and harden Kubernetes production clusters.",
        "required_skills": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Git"],
        "preferred_skills": ["Python", "Go", "GitHub Actions"],
        "benefits": ["Flexible hours", "Full healthcare", "Equipment package"],
        "department": "Cloud Platforms"
    },
    {
        "id": "job-106",
        "title": "AI & LLM Applications Engineer",
        "company": "Anthropic",
        "location": "San Francisco, CA (In-Office)",
        "role_category": "ai_ml",
        "role_id": "role-ai",
        "salary_range": "$190,000 - $260,000",
        "experience_level": "Senior (4+ YOE)",
        "workplace_type": "Onsite",
        "posted_days_ago": 1,
        "description": "Create state-of-the-art agent evaluation harnesses, RAG context retrieval pipelines, and high-throughput model inference endpoints.",
        "required_skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "NLP", "REST APIs", "Docker"],
        "preferred_skills": ["LangChain", "LLMs", "Scikit-Learn", "FastAPI"],
        "benefits": ["Top-tier equity", "Daily catered meals", "Comprehensive medical & wellness"],
        "department": "Model Applications"
    },
    {
        "id": "job-107",
        "title": "Data Scientist & Analytics Modeler",
        "company": "Airbnb",
        "location": "Seattle, WA / Remote",
        "role_category": "ai_ml",
        "role_id": "role-data-scientist",
        "salary_range": "$150,000 - $195,000",
        "experience_level": "Mid (2+ YOE)",
        "workplace_type": "Remote",
        "posted_days_ago": 6,
        "description": "Model guest demand elasticity, build statistical forecasting algorithms, and guide product experimentation with data pipelines.",
        "required_skills": ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Data Visualization", "Problem Solving"],
        "preferred_skills": ["Scikit-Learn", "PostgreSQL", "A/B Testing"],
        "benefits": ["Travel credit allowance", "Annual stipend", "Health coverage"],
        "department": "Guest Experience Insights"
    },
    {
        "id": "job-108",
        "title": "Creative 3D / WebGL Interaction Engineer",
        "company": "Active Theory",
        "location": "Los Angeles, CA / Remote",
        "role_category": "creative",
        "role_id": "role-creative-3d",
        "salary_range": "$140,000 - $185,000",
        "experience_level": "Mid-Senior (3+ YOE)",
        "workplace_type": "Remote",
        "posted_days_ago": 2,
        "description": "Craft award-winning 3D web experiences, shader effects, and kinetic typography using Three.js, React, and Framer Motion.",
        "required_skills": ["Three.js", "Framer Motion", "React", "WebGL", "GSAP", "JavaScript"],
        "preferred_skills": ["TypeScript", "Tailwind CSS", "Blender"],
        "benefits": ["Design conferences budget", "Flexible time off", "Health perks"],
        "department": "Creative Labs"
    }
]

class MatchRequest(BaseModel):
    skills: List[str]
    target_role: Optional[str] = None
    min_match_pct: Optional[int] = 0
    workplace_type: Optional[str] = None

class JobDescriptionAnalysisRequest(BaseModel):
    job_title: Optional[str] = "Target Role"
    job_description: str
    candidate_skills: List[str]

def calculate_match_metrics(candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str] = None):
    cand_lower = {s.strip().lower() for s in candidate_skills}
    matched_req = [s for s in required_skills if s.lower() in cand_lower]
    missing_req = [s for s in required_skills if s.lower() not in cand_lower]
    
    preferred_skills = preferred_skills or []
    matched_pref = [s for s in preferred_skills if s.lower() in cand_lower]

    req_score = (len(matched_req) / max(len(required_skills), 1)) * 85.0
    pref_score = (len(matched_pref) / max(len(preferred_skills), 1)) * 15.0 if preferred_skills else 15.0
    
    total_pct = min(100, int(round(req_score + pref_score)))
    return total_pct, matched_req, missing_req, matched_pref

@router.get("")
@router.get("/")
def get_jobs(
    role_category: Optional[str] = None,
    workplace_type: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Returns curated active job postings with optional filters.
    """
    results = JOB_CATALOG
    if role_category and role_category != "all":
        results = [j for j in results if j.get("role_category") == role_category or j.get("role_id") == role_category]
    if workplace_type and workplace_type != "all":
        results = [j for j in results if j.get("workplace_type", "").lower() == workplace_type.lower()]
    if search:
        s_lower = search.lower()
        results = [
            j for j in results
            if s_lower in j["title"].lower() or s_lower in j["company"].lower() or any(s_lower in sk.lower() for sk in j["required_skills"])
        ]
    return {
        "total": len(results),
        "jobs": results
    }

@router.post("/match")
def match_jobs(payload: MatchRequest):
    """
    Computes real-time match percentages between the candidate's skills and curated jobs.
    Returns sorted list from highest to lowest match percentage.
    """
    matched_list = []
    for job in JOB_CATALOG:
        match_pct, matched_req, missing_req, matched_pref = calculate_match_metrics(
            payload.skills,
            job["required_skills"],
            job.get("preferred_skills", [])
        )

        if match_pct < (payload.min_match_pct or 0):
            continue

        if payload.workplace_type and payload.workplace_type != "all":
            if job.get("workplace_type", "").lower() != payload.workplace_type.lower():
                continue

        fit_level = "High Match" if match_pct >= 80 else ("Strong Fit" if match_pct >= 60 else "Skill Growth Opportunity")

        matched_list.append({
            **job,
            "match_percentage": match_pct,
            "fit_level": fit_level,
            "matched_skills": matched_req,
            "missing_skills": missing_req,
            "matched_preferred": matched_pref,
            "match_highlights": f"You match {len(matched_req)} of {len(job['required_skills'])} core technical requirements."
        })

    # Sort descending by match percentage
    matched_list.sort(key=lambda x: x["match_percentage"], reverse=True)

    return {
        "candidate_skills_count": len(payload.skills),
        "total_matches": len(matched_list),
        "matches": matched_list
    }

@router.post("/analyze-jd")
def analyze_job_description(payload: JobDescriptionAnalysisRequest):
    """
    Parses an external pasted Job Description and produces an instant ATS compatibility score,
    identifying extracted skills, matched keywords, and gap recommendations.
    """
    jd_text = payload.job_description.lower()
    
    # Common tech keywords dictionary to extract from JD
    KNOWN_TECH_KEYWORDS = [
        "React", "Node.js", "Python", "TypeScript", "JavaScript", "Next.js", "Express",
        "FastAPI", "PostgreSQL", "SQL", "MongoDB", "Redis", "Docker", "Kubernetes",
        "AWS", "GCP", "Azure", "CI/CD", "Linux", "Git", "GraphQL", "REST APIs",
        "Microservices", "Data Structures", "Algorithms", "System Design",
        "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Pandas",
        "NumPy", "NLP", "Scikit-Learn", "Tailwind CSS", "HTML", "CSS", "Three.js",
        "Figma", "UI Design", "Terraform", "GitHub Actions"
    ]

    extracted_skills_from_jd = [
        kw for kw in KNOWN_TECH_KEYWORDS if kw.lower() in jd_text
    ]

    # If few detected, fallback to standard tech stack
    if len(extracted_skills_from_jd) < 3:
        extracted_skills_from_jd = ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST APIs"]

    cand_skills_lower = {s.strip().lower() for s in payload.candidate_skills}
    matched = [s for s in extracted_skills_from_jd if s.lower() in cand_skills_lower]
    missing = [s for s in extracted_skills_from_jd if s.lower() not in cand_skills_lower]

    match_score = int(round((len(matched) / max(len(extracted_skills_from_jd), 1)) * 100))

    action_suggestions = []
    if missing:
        action_suggestions.append(f"Add projects or experience highlighting: {', '.join(missing[:4])}.")
    if match_score < 70:
        action_suggestions.append("Tailor your resume summary to mirror the exact keywords found in this JD.")
    else:
        action_suggestions.append("Your background aligns strongly with the core requirements of this role.")

    return {
        "job_title": payload.job_title,
        "match_percentage": match_score,
        "extracted_skills_count": len(extracted_skills_from_jd),
        "required_skills": extracted_skills_from_jd,
        "matched_skills": matched,
        "missing_skills": missing,
        "recommendations": action_suggestions,
        "verdict": "Competitive Candidate" if match_score >= 75 else "Moderate Gap - Needs Keyword Alignment"
    }

