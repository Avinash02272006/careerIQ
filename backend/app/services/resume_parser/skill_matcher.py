import re
from typing import List, Dict, Any, Optional
from rapidfuzz import process, fuzz
from sqlalchemy.orm import Session
from app.db.models.skill import Skill

# Common tech alias dictionary to resolve synonyms
SKILL_ALIASES: Dict[str, str] = {
    "react.js": "React",
    "reactjs": "React",
    "react native": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express.js": "Express",
    "expressjs": "Express",
    "express": "Express",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "es6": "JavaScript",
    "py": "Python",
    "python3": "Python",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws cloud": "AWS",
    "amazon web services": "AWS",
    "gcp cloud": "GCP",
    "google cloud platform": "GCP",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "torch": "PyTorch",
    "pytorch": "PyTorch",
    "threejs": "Three.js",
    "three.js": "Three.js",
    "framer": "Framer Motion",
    "framer motion": "Framer Motion",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "rest": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful": "REST APIs",
    "restful apis": "REST APIs",
    "ci cd": "CI/CD",
    "cicd": "CI/CD",
    "ci/cd": "CI/CD",
    "dsa": "Data Structures",
    "data structures": "Data Structures",
    "algorithms": "Algorithms",
    "algo": "Algorithms",
    "system design": "System Design",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
}


def normalize_skills(
    candidate_tokens: List[str],
    db: Session,
    full_text: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Normalizes candidate skill tokens into validated system skills:
    1. Direct alias dictionary lookup
    2. Exact boundary matching in full resume text for high-value skills
    3. RapidFuzz token matching against all Skill records in DB
    """
    known_skills = db.query(Skill).all()
    known_names = [s.name for s in known_skills]
    name_to_category = {s.name: s.category for s in known_skills}
    known_lower_map = {s.name.lower(): s.name for s in known_skills}

    matched_dict: Dict[str, Dict[str, Any]] = {}

    # Step 1: Scan full text for exact occurrences of known skill names & aliases
    search_corpus = f"{' '.join(candidate_tokens)} {full_text or ''}".lower()

    for alias, canonical in SKILL_ALIASES.items():
        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, search_corpus):
            if canonical in name_to_category:
                matched_dict[canonical] = {
                    "name": canonical,
                    "category": name_to_category.get(canonical, "tools"),
                    "confidence": 0.98,
                }

    for skill in known_skills:
        pattern = r"\b" + re.escape(skill.name.lower()) + r"\b"
        if re.search(pattern, search_corpus):
            matched_dict[skill.name] = {
                "name": skill.name,
                "category": skill.category,
                "confidence": 0.95,
            }

    # Step 2: Fuzzy match any unmatched candidate tokens
    for token in candidate_tokens:
        clean_tok = token.strip()
        if not clean_tok or len(clean_tok) < 2:
            continue

        lower_tok = clean_tok.lower()
        if lower_tok in SKILL_ALIASES:
            canonical = SKILL_ALIASES[lower_tok]
            if canonical in name_to_category:
                matched_dict[canonical] = {
                    "name": canonical,
                    "category": name_to_category[canonical],
                    "confidence": 0.99,
                }
                continue

        if lower_tok in known_lower_map:
            canonical = known_lower_map[lower_tok]
            matched_dict[canonical] = {
                "name": canonical,
                "category": name_to_category[canonical],
                "confidence": 0.99,
            }
            continue

        # RapidFuzz match
        result = process.extractOne(clean_tok, known_names, scorer=fuzz.WRatio)
        if result and result[1] >= 82:
            matched_name = result[0]
            if matched_name not in matched_dict:
                matched_dict[matched_name] = {
                    "name": matched_name,
                    "category": name_to_category.get(matched_name, "tools"),
                    "confidence": round(result[1] / 100, 2),
                }

    # Return as structured list sorted alphabetically
    result_list = list(matched_dict.values())
    result_list.sort(key=lambda x: x["name"])
    return result_list
