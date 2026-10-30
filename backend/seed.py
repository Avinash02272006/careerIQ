import uuid
from app.db.session import SessionLocal
from app.db.models.role import Role
from app.db.models.skill import Skill
from app.db.models.user import User
from app.db.models.resume import Resume
from app.db.models.profile import Profile
from app.db.models.readiness_score import ReadinessScore
from app.db.models.role_compatibility import RoleCompatibility
from app.db.models.skill_gap import SkillGap
from app.db.models.learning_plan import LearningPlan
from app.core.security import hash_password
from datetime import datetime

db = SessionLocal()

# ---------- 1. SKILLS CATALOG ----------
skills_data = [
    # frontend
    ("HTML", "frontend"), ("CSS", "frontend"), ("JavaScript", "frontend"),
    ("React", "frontend"), ("Tailwind CSS", "frontend"), ("TypeScript", "frontend"),
    ("Redux", "frontend"), ("Next.js", "frontend"), ("Vue.js", "frontend"),
    ("Angular", "frontend"), ("RxJS", "frontend"), ("Sass", "frontend"),
    ("Bootstrap", "frontend"), ("Webpack", "frontend"), ("Vite", "frontend"),

    # backend
    ("Python", "backend"), ("Node.js", "backend"), ("FastAPI", "backend"),
    ("Django", "backend"), ("Express.js", "backend"), ("Express", "backend"),
    ("REST APIs", "backend"), ("GraphQL", "backend"), ("Microservices", "backend"),
    ("Java", "backend"), ("Spring Boot", "backend"), ("Go", "backend"),
    ("Flask", "backend"), ("NestJS", "backend"), ("gRPC", "backend"),

    # databases
    ("SQL", "database"), ("PostgreSQL", "database"), ("MongoDB", "database"),
    ("Redis", "database"), ("Database Design", "database"), ("MySQL", "database"),
    ("SQLite", "database"), ("Firebase", "database"), ("Elasticsearch", "database"),

    # dsa & systems
    ("Data Structures", "dsa"), ("Algorithms", "dsa"), ("Problem Solving", "dsa"),
    ("System Design", "dsa"), ("Distributed Systems", "dsa"), ("OOP", "dsa"),

    # ai_ml
    ("Machine Learning", "ai_ml"), ("Deep Learning", "ai_ml"), ("Scikit-Learn", "ai_ml"),
    ("TensorFlow", "ai_ml"), ("PyTorch", "ai_ml"), ("NLP", "ai_ml"),
    ("Computer Vision", "ai_ml"), ("Pandas", "ai_ml"), ("NumPy", "ai_ml"),
    ("XGBoost", "ai_ml"), ("Data Visualization", "ai_ml"), ("LLMs", "ai_ml"),
    ("Generative AI", "ai_ml"), ("LangChain", "ai_ml"),

    # devops / tools
    ("Git", "tools"), ("Docker", "tools"), ("CI/CD", "tools"), ("AWS", "tools"),
    ("Linux", "tools"), ("Kubernetes", "tools"), ("GCP", "tools"),
    ("Azure", "tools"), ("Terraform", "tools"), ("GitHub Actions", "tools"),

    # creative / 3d
    ("Three.js", "creative"), ("Framer Motion", "creative"), ("WebGL", "creative"),
    ("GSAP", "creative"), ("Blender", "creative"),

    # design
    ("Figma", "design"), ("UI Design", "design"), ("UX Research", "design"),
    ("Prototyping", "design"), ("Wireframing", "design"), ("Design Systems", "design"),

    # soft skills
    ("Communication", "soft_skill"), ("Teamwork", "soft_skill"),
    ("Leadership", "soft_skill"), ("Problem Solving Mindset", "soft_skill"),
    ("Time Management", "soft_skill"), ("Agile / Scrum", "soft_skill"),
]

skill_objects = {}
for name, category in skills_data:
    existing_skill = db.query(Skill).filter(Skill.name == name).first()
    if not existing_skill:
        skill = Skill(id=uuid.uuid4(), name=name, category=category)
        db.add(skill)
        skill_objects[name] = skill
    else:
        existing_skill.category = category
        skill_objects[name] = existing_skill

db.commit()
print(f"Seeded {len(skills_data)} skills.")


# ---------- 2. INDUSTRY BENCHMARK ROLES ----------
def sk(name, weight=1.0, min_level=0.5):
    return {"skill": name, "weight": weight, "min_level": min_level}

roles_data = [
    {
        "title": "Full Stack Developer",
        "description": "Works across client React interfaces and scalable backend Node.js / Express services with relational databases.",
        "required_skills": [
            sk("React", 1.0), sk("Node.js", 1.0), sk("Express", 0.9),
            sk("PostgreSQL", 0.8), sk("REST APIs", 0.8), sk("TypeScript", 0.8),
            sk("Git", 0.6), sk("Docker", 0.6)
        ],
        "market_demand_index": 0.94,
    },
    {
        "title": "Frontend Developer",
        "description": "Builds high-performance client web applications with modern JS frameworks, TypeScript, and responsive CSS.",
        "required_skills": [
            sk("HTML", 0.8), sk("CSS", 0.8), sk("JavaScript", 1.0),
            sk("React", 1.0), sk("Next.js", 0.8), sk("TypeScript", 0.9),
            sk("Tailwind CSS", 0.7), sk("Git", 0.6)
        ],
        "market_demand_index": 0.92,
    },
    {
        "title": "Backend Developer",
        "description": "Designs and builds server-side microservices, REST APIs, cache layers, and scalable database schemas.",
        "required_skills": [
            sk("Python", 1.0), sk("FastAPI", 0.8), sk("SQL", 0.9),
            sk("PostgreSQL", 0.9), sk("REST APIs", 0.8), sk("Docker", 0.7),
            sk("Redis", 0.7), sk("Microservices", 0.7)
        ],
        "market_demand_index": 0.90,
    },
    {
        "title": "DevOps & Cloud Engineer",
        "description": "Automates continuous delivery pipelines, orchestrates container clusters, and provisions AWS cloud infrastructure.",
        "required_skills": [
            sk("Docker", 1.0), sk("Kubernetes", 0.9), sk("CI/CD", 0.9),
            sk("AWS", 0.9), sk("Linux", 0.8), sk("Terraform", 0.7),
            sk("Git", 0.6)
        ],
        "market_demand_index": 0.91,
    },
    {
        "title": "AI & Machine Learning Engineer",
        "description": "Develops, trains, and productionizes deep learning models, LLMs, and intelligent automation pipelines.",
        "required_skills": [
            sk("Python", 1.0), sk("Machine Learning", 1.0), sk("Deep Learning", 0.8),
            sk("PyTorch", 0.8), sk("Scikit-Learn", 0.7), sk("NLP", 0.7),
            sk("REST APIs", 0.6), sk("Docker", 0.6)
        ],
        "market_demand_index": 0.95,
    },
    {
        "title": "Data Scientist",
        "description": "Extracts actionable insights, engineers statistical models, and creates predictive data pipelines.",
        "required_skills": [
            sk("Python", 1.0), sk("SQL", 0.9), sk("Machine Learning", 0.9),
            sk("Pandas", 0.8), sk("NumPy", 0.7), sk("Data Visualization", 0.8),
            sk("Problem Solving", 0.7)
        ],
        "market_demand_index": 0.88,
    },
    {
        "title": "Data Analyst",
        "description": "Transforms raw company datasets into executive dashboards, business metrics, and statistical reports.",
        "required_skills": [
            sk("SQL", 1.0), sk("Python", 0.8), sk("Pandas", 0.8),
            sk("Data Visualization", 0.9), sk("NumPy", 0.6), sk("Communication", 0.7)
        ],
        "market_demand_index": 0.82,
    },
    {
        "title": "Creative 3D Web Engineer",
        "description": "Crafts interactive 3D WebGL scenes, shader animations, and fluid motion interfaces using Three.js & Framer Motion.",
        "required_skills": [
            sk("Three.js", 1.0), sk("Framer Motion", 0.9), sk("React", 0.8),
            sk("WebGL", 0.8), sk("GSAP", 0.7), sk("JavaScript", 0.8)
        ],
        "market_demand_index": 0.85,
    },
    {
        "title": "UI/UX Designer & Prototyper",
        "description": "Designs intuitive user interfaces, visual design systems, user journey maps, and high-fidelity Figma prototypes.",
        "required_skills": [
            sk("Figma", 1.0), sk("UI Design", 1.0), sk("UX Research", 0.8),
            sk("Prototyping", 0.8), sk("Wireframing", 0.7), sk("Design Systems", 0.8)
        ],
        "market_demand_index": 0.78,
    },
    {
        "title": "Software Engineer (DSA & Systems)",
        "description": "Builds robust software applications with emphasis on optimal algorithms, data structures, and system design.",
        "required_skills": [
            sk("Data Structures", 1.0), sk("Algorithms", 1.0), sk("System Design", 0.9),
            sk("Problem Solving", 0.9), sk("Git", 0.6), sk("SQL", 0.6)
        ],
        "market_demand_index": 0.89,
    },
]

for r in roles_data:
    existing_role = db.query(Role).filter(Role.title == r["title"]).first()
    if not existing_role:
        role = Role(
            id=uuid.uuid4(),
            title=r["title"],
            description=r["description"],
            required_skills=r["required_skills"],
            market_demand_index=r["market_demand_index"],
        )
        db.add(role)
    else:
        existing_role.description = r["description"]
        existing_role.required_skills = r["required_skills"]
        existing_role.market_demand_index = r["market_demand_index"]

db.commit()
print("Seeded roles.")


# ---------- 3. DEMO USER ACCOUNT ----------
demo_email = "developer@example.com"
demo_user = db.query(User).filter(User.email == demo_email).first()
if not demo_user:
    demo_user = User(
        id=uuid.uuid4(),
        email=demo_email,
        password_hash=hash_password("password123"),
        full_name="Alex Morgan",
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    print(f"Created demo user: {demo_email}")
else:
    demo_user.full_name = "Alex Morgan"
    demo_user.password_hash = hash_password("password123")
    db.commit()
    print(f"Updated demo user: {demo_email}")

# Ensure demo user has an active resume and profile
demo_resume = db.query(Resume).filter(Resume.user_id == demo_user.id).first()
if not demo_resume:
    demo_resume = Resume(
        id=uuid.uuid4(),
        user_id=demo_user.id,
        file_path="uploads/demo_resume.pdf",
        raw_text="Alex Morgan\nalex.morgan@developer.io\nSan Francisco, CA\n\nSUMMARY\nFull Stack Developer with 3+ years building high-throughput web applications with React, Node.js, Express, and PostgreSQL.\n\nTECHNICAL SKILLS\nReact, JavaScript, TypeScript, Node.js, Express, PostgreSQL, SQL, REST APIs, Git, Docker, Tailwind CSS, HTML, CSS\n\nEXPERIENCE\nSoftware Engineer | TechScale Inc. | 2023 - Present\n• Developed and deployed scalable microservices using Node.js, Express, and PostgreSQL, reducing API latency by 35%.\n• Built reactive customer-facing analytics dashboards using React, TypeScript, and Tailwind CSS.\n• Configured automated CI/CD workflows and containerized applications with Docker.\n\nPROJECTS\nReal-Time Microservices API (Node.js, Express, PostgreSQL, Redis)\n• Engineered distributed API gateway handling 15,000+ daily requests with JWT authentication.\nInteractive 3D Data Visualizer (React, Three.js, Framer Motion)\n• Created spatial graph visualizer rendering interactive nodes and constellation networks.\n\nEDUCATION\nBachelor of Science in Computer Science | State University | 2019 - 2023 | GPA: 3.8",
        quality_score=88.0,
        parsed_at=datetime.utcnow(),
    )
    db.add(demo_resume)
    db.commit()

demo_profile = db.query(Profile).filter(Profile.user_id == demo_user.id).first()
demo_skills = [
    {"name": "React", "category": "frontend", "confidence": 0.98},
    {"name": "JavaScript", "category": "frontend", "confidence": 0.99},
    {"name": "TypeScript", "category": "frontend", "confidence": 0.92},
    {"name": "Tailwind CSS", "category": "frontend", "confidence": 0.90},
    {"name": "Node.js", "category": "backend", "confidence": 0.96},
    {"name": "Express", "category": "backend", "confidence": 0.94},
    {"name": "REST APIs", "category": "backend", "confidence": 0.95},
    {"name": "PostgreSQL", "category": "database", "confidence": 0.93},
    {"name": "SQL", "category": "database", "confidence": 0.91},
    {"name": "Git", "category": "tools", "confidence": 0.95},
    {"name": "HTML", "category": "frontend", "confidence": 0.99},
    {"name": "CSS", "category": "frontend", "confidence": 0.99},
]

if not demo_profile:
    demo_profile = Profile(
        id=uuid.uuid4(),
        user_id=demo_user.id,
        resume_id=demo_resume.id,
        skills=demo_skills,
        experience=[{
            "role_hint": "engineer",
            "company": "TechScale Inc.",
            "raw_line": "Software Engineer | TechScale Inc. | 2023 - Present",
            "start": "2023",
            "end": "Present"
        }],
        projects=[{
            "title": "Real-Time Microservices API",
            "description": "Engineered distributed API gateway handling 15,000+ daily requests with JWT authentication and Redis caching.",
            "tech_stack": ["Node.js", "Express", "PostgreSQL", "Redis"]
        }, {
            "title": "Interactive 3D Data Visualizer",
            "description": "Client dashboard built using React, Three.js, and Framer Motion with spatial camera controls.",
            "tech_stack": ["React", "Three.js", "Framer Motion"]
        }],
        education=[{
            "degree": "bachelor",
            "institution": "State University",
            "cgpa": 3.8,
            "start_year": "2019",
            "end_year": "2023",
            "raw_line": "Bachelor of Science in Computer Science | State University | GPA: 3.8"
        }]
    )
    db.add(demo_profile)
    db.commit()

# Run career analysis for demo user
from app.services.career_analysis import analyze_career
analyze_career(str(demo_user.id), db)

db.close()
print("All database seeding completed successfully!")
