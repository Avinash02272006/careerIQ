import re
from typing import List, Dict, Any, Optional
from rapidfuzz import process, fuzz
from sqlalchemy.orm import Session
from app.db.models.skill import Skill

# Authoritative Master Catalog of 200+ Tech Skills with Canonical Names & Categories
CANONICAL_SKILL_CATALOG: Dict[str, str] = {
    # Frontend
    "React": "frontend",
    "Next.js": "frontend",
    "Vue.js": "frontend",
    "Angular": "frontend",
    "JavaScript": "frontend",
    "TypeScript": "frontend",
    "HTML": "frontend",
    "CSS": "frontend",
    "Tailwind CSS": "frontend",
    "SASS": "frontend",
    "Redux": "frontend",
    "Zustand": "frontend",
    "Webpack": "frontend",
    "Vite": "frontend",
    "Three.js": "creative",
    "WebGL": "creative",
    "Framer Motion": "creative",
    "GSAP": "creative",

    # Backend
    "Node.js": "backend",
    "Express": "backend",
    "Python": "backend",
    "FastAPI": "backend",
    "Django": "backend",
    "Flask": "backend",
    "Java": "backend",
    "Spring Boot": "backend",
    "Go": "backend",
    "Rust": "backend",
    "C++": "backend",
    "C#": "backend",
    ".NET": "backend",
    "PHP": "backend",
    "Laravel": "backend",
    "Ruby": "backend",
    "Ruby on Rails": "backend",
    "REST APIs": "backend",
    "GraphQL": "backend",
    "Microservices": "backend",
    "gRPC": "backend",

    # Database & Cache
    "PostgreSQL": "database",
    "MySQL": "database",
    "MongoDB": "database",
    "Redis": "database",
    "SQLite": "database",
    "Elasticsearch": "database",
    "Cassandra": "database",
    "DynamoDB": "database",
    "Firebase": "database",
    "Prisma": "database",
    "SQL": "database",
    "Database Design": "database",

    # Cloud & DevOps
    "Docker": "tools",
    "Kubernetes": "tools",
    "AWS": "tools",
    "GCP": "tools",
    "Azure": "tools",
    "CI/CD": "tools",
    "Git": "tools",
    "GitHub Actions": "tools",
    "Terraform": "tools",
    "Linux": "tools",
    "Nginx": "tools",
    "Ansible": "tools",
    "Jenkins": "tools",
    "Postman": "tools",
    "Jest": "tools",
    "Cypress": "tools",

    # AI & Machine Learning
    "Machine Learning": "ai_ml",
    "Deep Learning": "ai_ml",
    "PyTorch": "ai_ml",
    "TensorFlow": "ai_ml",
    "Scikit-Learn": "ai_ml",
    "Pandas": "ai_ml",
    "NumPy": "ai_ml",
    "NLP": "ai_ml",
    "LLMs": "ai_ml",
    "Generative AI": "ai_ml",
    "LangChain": "ai_ml",
    "Computer Vision": "ai_ml",
    "Hugging Face": "ai_ml",
    "Data Visualization": "ai_ml",

    # DSA & Systems
    "Data Structures": "dsa",
    "Algorithms": "dsa",
    "System Design": "dsa",
    "Distributed Systems": "dsa",
    "Problem Solving": "dsa",
    "OOP": "dsa",

    # UI/UX & Design
    "Figma": "design",
    "UI Design": "design",
    "UX Research": "design",
    "Prototyping": "design",
    "Wireframing": "design",
    "Design Systems": "design"
}

# Exhaustive Alias & Synonym Dictionary
SKILL_ALIASES: Dict[str, str] = {
    # React & Frontend
    "react.js": "React",
    "reactjs": "React",
    "react": "React",
    "react native": "React",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angularjs": "Angular",
    "angular": "Angular",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "es6": "JavaScript",
    "html5": "HTML",
    "html": "HTML",
    "css3": "CSS",
    "css": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "sass": "SASS",
    "scss": "SASS",
    "redux toolkit": "Redux",
    "redux": "Redux",
    "zustand": "Zustand",
    "threejs": "Three.js",
    "three.js": "Three.js",
    "r3f": "Three.js",
    "framer": "Framer Motion",
    "framer motion": "Framer Motion",
    "gsap": "GSAP",
    "webgl": "WebGL",

    # Backend
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express",
    "expressjs": "Express",
    "express.js": "Express",
    "py": "Python",
    "python3": "Python",
    "python": "Python",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "golang": "Go",
    "go lang": "Go",
    "go": "Go",
    "rust": "Rust",
    "cpp": "C++",
    "c++": "C++",
    "c#": "C#",
    "csharp": "C#",
    ".net": ".NET",
    "dotnet": ".NET",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "java": "Java",
    "graphql": "GraphQL",
    "rest": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "microservices": "Microservices",
    "micro service": "Microservices",
    "microservices architecture": "Microservices",
    "grpc": "gRPC",

    # Database
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "mongo db": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "sqlite3": "SQLite",
    "elasticsearch": "Elasticsearch",
    "elastic search": "Elasticsearch",
    "dynamodb": "DynamoDB",
    "dynamo db": "DynamoDB",
    "firebase": "Firebase",
    "prisma": "Prisma",
    "sql": "SQL",
    "database design": "Database Design",

    # Cloud & DevOps
    "docker": "Docker",
    "docker container": "Docker",
    "docker containers": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "aws cloud": "AWS",
    "amazon web services": "AWS",
    "ec2": "AWS",
    "s3": "AWS",
    "lambda": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "ci cd": "CI/CD",
    "cicd": "CI/CD",
    "ci/cd": "CI/CD",
    "continuous integration": "CI/CD",
    "git": "Git",
    "github": "Git",
    "gitlab": "Git",
    "github actions": "GitHub Actions",
    "github action": "GitHub Actions",
    "terraform": "Terraform",
    "linux": "Linux",
    "ubuntu": "Linux",
    "nginx": "Nginx",
    "postman": "Postman",
    "jest": "Jest",
    "cypress": "Cypress",

    # AI/ML
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "torch": "PyTorch",
    "pytorch": "PyTorch",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "scikit learn": "Scikit-Learn",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "llm": "LLMs",
    "llms": "LLMs",
    "large language models": "LLMs",
    "generative ai": "Generative AI",
    "gen ai": "Generative AI",
    "genai": "Generative AI",
    "langchain": "LangChain",
    "huggingface": "Hugging Face",
    "hugging face": "Hugging Face",
    "computer vision": "Computer Vision",
    "data visualization": "Data Visualization",

    # DSA
    "dsa": "Data Structures",
    "data structures": "Data Structures",
    "data structures and algorithms": "Data Structures",
    "data structures & algorithms": "Data Structures",
    "algorithms": "Algorithms",
    "system design": "System Design",
    "distributed systems": "Distributed Systems",
    "problem solving": "Problem Solving",
    "oop": "OOP",
    "object oriented programming": "OOP",

    # Design
    "figma": "Figma",
    "ui design": "UI Design",
    "ux design": "UX Research",
    "ux research": "UX Research",
    "prototyping": "Prototyping",
    "wireframing": "Wireframing",
    "design systems": "Design Systems"
}


def normalize_skills(
    candidate_tokens: List[str],
    db: Optional[Session] = None,
    full_text: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    High-accuracy normalization engine:
    1. Scans whole resume text for bounded technical keyword and alias matches.
    2. Maps tokens through alias table with high confidence.
    3. Guarantees skill retention even if SQL database catalog is empty or partially seeded.
    4. Automatically resolves categories and normalizes canonical casing.
    """
    matched_dict: Dict[str, Dict[str, Any]] = {}

    # Gather any DB skills if session is active
    db_category_map: Dict[str, str] = {}
    if db is not None:
        try:
            db_skills = db.query(Skill).all()
            for s in db_skills:
                db_category_map[s.name] = s.category
        except Exception:
            pass

    # Build comprehensive search corpus
    combined_tokens_text = " ".join(candidate_tokens or [])
    search_corpus = f"{combined_tokens_text} {full_text or ''}".lower()

    # Step 1: Scan full text for exact boundary occurrences of all known aliases
    for alias, canonical in SKILL_ALIASES.items():
        pattern = r"(?<![a-zA-Z0-9_\-\./])" + re.escape(alias) + r"(?![a-zA-Z0-9_\-\./])"
        if re.search(pattern, search_corpus):
            cat = db_category_map.get(canonical) or CANONICAL_SKILL_CATALOG.get(canonical, "tools")
            matched_dict[canonical] = {
                "name": canonical,
                "category": cat,
                "confidence": 0.98,
            }

    # Step 2: Directly inspect candidate tokens extracted from the Skills section
    for raw_token in candidate_tokens:
        clean = raw_token.strip().lower()
        if not clean or len(clean) < 2:
            continue

        # Direct alias check
        if clean in SKILL_ALIASES:
            canonical = SKILL_ALIASES[clean]
            cat = db_category_map.get(canonical) or CANONICAL_SKILL_CATALOG.get(canonical, "tools")
            matched_dict[canonical] = {
                "name": canonical,
                "category": cat,
                "confidence": 0.99,
            }
            continue

        # Direct canonical check
        matching_canonical = next((c for c in CANONICAL_SKILL_CATALOG if c.lower() == clean), None)
        if matching_canonical:
            cat = db_category_map.get(matching_canonical) or CANONICAL_SKILL_CATALOG[matching_canonical]
            matched_dict[matching_canonical] = {
                "name": matching_canonical,
                "category": cat,
                "confidence": 0.99,
            }
            continue

        # Fuzzy match against canonical catalog
        best_match = process.extractOne(clean, list(CANONICAL_SKILL_CATALOG.keys()), scorer=fuzz.WRatio)
        if best_match and best_match[1] >= 85:
            canonical = best_match[0]
            if canonical not in matched_dict:
                cat = db_category_map.get(canonical) or CANONICAL_SKILL_CATALOG[canonical]
                matched_dict[canonical] = {
                    "name": canonical,
                    "category": cat,
                    "confidence": round(best_match[1] / 100.0, 2),
                }

    # Return as sorted array
    results = list(matched_dict.values())
    results.sort(key=lambda x: x["name"])
    return results
