import os
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.resume import Resume
from app.db.models.profile import Profile
from app.schemas.resume import ResumeUploadResponse, ResumeStatusResponse, ParseTextRequest
from app.services.resume_parser.pipeline import process_resume, parse_resume_content
from app.api.v1.deps import get_current_user_or_guest
from app.db.models.user import User

router = APIRouter(prefix="/resume", tags=["resume"])

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".txt", ".md",
    ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"
}

SAMPLE_RESUME_TEXT = """Alex Morgan
alex.morgan@developer.io | (555) 234-5678 | San Francisco, CA
https://github.com/alexmorgan-dev | https://linkedin.com/in/alexmorgan-engineer

SUMMARY
High-impact Full Stack Engineer with 3+ years of experience engineering distributed web services and interactive client applications. Specialized in React, Node.js, Express, PostgreSQL, and Docker containerization. Proven track record of improving system latency by 35% and deploying production architectures handling 20,000+ daily active users.

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
• Frontend Engineering: React, Next.js, Redux, Tailwind CSS, Three.js, Framer Motion
• Backend & Systems: Node.js, Express, FastAPI, REST APIs, Microservices, GraphQL
• Databases & Caching: PostgreSQL, MongoDB, Redis, Database Design
• Cloud & DevOps: Docker, Kubernetes, CI/CD, AWS, Linux, Git, GitHub Actions

PROFESSIONAL EXPERIENCE
Full Stack Software Engineer | TechScale Solutions Inc. | 2023 - Present
• Architected and deployed microservices backend using Node.js, Express, and PostgreSQL, reducing API response latency by 35%.
• Engineered customer-facing reactive dashboards using React 19, TypeScript, and Tailwind CSS serving 15,000+ daily sessions.
• Configured automated GitHub Actions CI/CD workflows and containerized multi-stage deployments with Docker on AWS.
• Implemented distributed cache-aside layer with Redis, reducing database CPU load by 42%.

Associate Software Developer | CloudSprint Labs | 2021 - 2023
• Developed and maintained 14+ REST APIs handling data pipelines and user authentication with JWT.
• Refactored legacy monolithic views into modular React components, boosting client render performance by 28%.
• Collaborated in cross-functional agile sprints, conducting code reviews and optimizing SQL query execution plans.

KEY PROJECTS
Real-Time Distributed Microservices Gateway (Node.js, Express, PostgreSQL, Redis, Docker)
• Engineered high-throughput API gateway processing 25,000+ daily requests with rate limiting and automated JWT auth.
• Designed relational schema with connection pooling in PostgreSQL handling complex transactional joins.

Interactive 3D Data Constellation (React, Three.js, WebGL, Framer Motion)
• Created spatial graph visualizer rendering 500+ interconnected technology nodes with 60 FPS WebGL shaders.
• Integrated spring-physics gesture controls and smooth camera orbits for interactive data exploration.

EDUCATION
Bachelor of Science in Computer Science | State University of California | 2017 - 2021
• GPA: 3.8 / 4.0 | Dean's Honor Roll
• Core Coursework: Data Structures & Algorithms, Distributed Systems, Database Management, System Design
"""


@router.post("/upload", response_model=ResumeUploadResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    ext = os.path.splitext(file.filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Please upload a PDF, DOCX, or TXT file.",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    resume_id = uuid.uuid4()
    saved_file_name = f"{resume_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_file_name)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    resume = Resume(id=resume_id, user_id=current_user.id, file_path=file_path)
    db.add(resume)
    db.commit()

    # Process resume synchronously so client receives immediate, actionable diagnostic results
    parsed = process_resume(str(resume_id), file_path, str(current_user.id))

    quality_score = parsed["quality_audit"]["overall_score"] if parsed else 80.0

    return ResumeUploadResponse(
        resume_id=resume_id,
        status="done",
        quality_score=quality_score,
        extracted_data=parsed,
    )


@router.post("/parse-text", response_model=ResumeUploadResponse)
def parse_text_resume(
    payload: ParseTextRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    """Allows direct resume text pasting without needing a PDF file."""
    if not payload.text or len(payload.text.strip()) < 30:
        raise HTTPException(status_code=400, detail="Resume text must contain at least 30 characters.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    resume_id = uuid.uuid4()
    file_path = os.path.join(UPLOAD_DIR, f"{resume_id}.txt")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(payload.text)

    resume = Resume(id=resume_id, user_id=current_user.id, file_path=file_path)
    db.add(resume)
    db.commit()

    parsed = process_resume(str(resume_id), file_path, str(current_user.id))
    quality_score = parsed["quality_audit"]["overall_score"] if parsed else 80.0

    return ResumeUploadResponse(
        resume_id=resume_id,
        status="done",
        quality_score=quality_score,
        extracted_data=parsed,
    )


@router.get("/sample")
def get_sample_resume():
    """Returns realistic sample resume text for testing ATS extraction."""
    return {
        "title": "Senior Full Stack Engineer Resume",
        "sample_text": SAMPLE_RESUME_TEXT,
    }


@router.get("/{resume_id}/status", response_model=ResumeStatusResponse)
def get_resume_status(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest),
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    status = "done" if resume.parsed_at else "processing"
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    extracted_data = None
    if profile:
        extracted_data = {
            "skills": profile.skills or [],
            "experience": profile.experience or [],
            "projects": profile.projects or [],
            "education": profile.education or [],
            "contact_info": profile.achievements.get("contact") if profile.achievements else None,
            "quality_audit": profile.certifications.get("quality_audit") if profile.certifications else None,
        }

    return ResumeStatusResponse(
        resume_id=resume.id,
        status=status,
        quality_score=float(resume.quality_score) if resume.quality_score is not None else None,
        extracted_data=extracted_data,
    )
