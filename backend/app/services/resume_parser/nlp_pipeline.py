import re
from typing import List, Dict, Any, Optional

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

SECTION_HEADERS = {
    "summary": [
        "summary", "professional summary", "executive summary", "profile",
        "career objective", "objective", "about me", "overview",
    ],
    "skills": [
        "technical skills", "skills & competencies", "core competencies",
        "skills", "technologies", "tech stack", "technical proficiencies",
        "areas of expertise", "programming languages", "tools & technologies",
        "competencies", "key skills", "frameworks", "tools",
    ],
    "experience": [
        "professional experience", "work experience", "experience",
        "employment history", "work history", "internships", "career history",
        "relevant experience", "professional background",
    ],
    "projects": [
        "projects", "personal projects", "academic projects", "key projects",
        "notable projects", "technical projects", "open source", "selected projects",
    ],
    "education": [
        "education", "academic background", "academic qualifications",
        "studies", "educational background", "degrees & certifications",
        "academics",
    ],
    "certifications": [
        "certifications", "certificates", "licenses & certifications",
        "licenses", "courses", "professional certifications",
    ],
    "achievements": [
        "achievements", "awards", "honors & awards", "honors",
        "accomplishments", "publications", "leadership & activities",
    ],
}


def clean_header_line(line: str) -> str:
    """Strips markdown, bullets, colons, numbers, and extra spaces."""
    cleaned = line.strip().lower()
    cleaned = re.sub(r"^[#\*\-•\d\.\s\)\:]+", "", cleaned)
    cleaned = re.sub(r"[:\s\*\-]+$", "", cleaned)
    return cleaned.strip()


def split_into_sections(raw_text: str) -> Dict[str, str]:
    """
    Intelligently segments the resume into structured sections.
    """
    lines = raw_text.split("\n")
    sections: Dict[str, List[str]] = {key: [] for key in SECTION_HEADERS}
    current_section = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        clean = clean_header_line(stripped)

        # Check if line matches a known section header
        matched_section = None
        # Heuristic: headers are usually short (under 7 words)
        if len(clean.split()) <= 6:
            for section, keywords in SECTION_HEADERS.items():
                for kw in keywords:
                    if clean == kw or clean.startswith(kw + " ") or clean.endswith(" " + kw):
                        matched_section = section
                        break
                if matched_section:
                    break

        if matched_section:
            current_section = matched_section
            continue

        if current_section:
            sections[current_section].append(stripped)
        else:
            # Header block before first recognized section (name, contact, intro)
            sections["summary"].append(stripped)

    return {k: "\n".join(v).strip() for k, v in sections.items()}


def extract_contact_info(raw_text: str) -> Dict[str, Any]:
    """
    Extracts candidate name, email, phone number, and online portfolio links.
    """
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", raw_text)
    phone_match = re.search(
        r"(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})", raw_text
    )

    github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+", raw_text, re.I)
    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+", raw_text, re.I)
    portfolio_match = re.search(r"https?://[a-zA-Z0-9.-]+\.(?:io|dev|app|me|com)(?:/[^\s]*)?", raw_text, re.I)

    # Candidate Name heuristic: Look at the first 4 non-empty lines
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    candidate_name = None
    for line in lines[:4]:
        # Filter out email, phone, links, and obvious titles
        if "@" in line or "http" in line or "github" in line or "linkedin" in line:
            continue
        if any(char.isdigit() for char in line):
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()):
            candidate_name = line
            break

    return {
        "name": candidate_name or "Candidate",
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "github": github_match.group(0) if github_match else None,
        "linkedin": linkedin_match.group(0) if linkedin_match else None,
        "portfolio": portfolio_match.group(0) if portfolio_match else None,
    }


def extract_candidate_skills(skills_section_text: str, full_resume_text: str = "") -> List[str]:
    """
    Extracts raw skill candidates from the skills section as well as scanning
    the broader resume for delimited technical terms.
    """
    tokens = set()

    # 1. Delimit skills section by commas, pipes, bullets, slashes, or newlines
    if skills_section_text:
        raw_tokens = re.split(r"[,\n•|;/]", skills_section_text)
        for t in raw_tokens:
            cleaned = t.strip()
            # Remove leading bullets or colons
            cleaned = re.sub(r"^[\*\-•:\s]+", "", cleaned).strip()
            # Remove category prefixes like "Frontend: React, Vue" -> "Frontend" is filtered, items extracted
            if ":" in cleaned:
                sub_parts = cleaned.split(":")
                for sp in sub_parts:
                    if sp.strip():
                        tokens.add(sp.strip())
            elif cleaned and len(cleaned) < 40 and not cleaned.endswith("."):
                tokens.add(cleaned)

    # 2. Extract common technical acronyms or multi-word terms from full text
    return list(tokens)


DEGREE_KEYWORDS = [
    "b.tech", "btech", "bachelor", "b.e", "be ", "b.sc", "bsc", "b.s", "bs ",
    "m.tech", "mtech", "master", "m.sc", "msc", "m.s", "ms ", "mba", "phd", "doctorate",
    "diploma", "associate", "12th", "10th", "hsc", "ssc",
]

CGPA_PATTERN = re.compile(r"(?:cgpa|gpa|grade)[:\s]*([\d.]+)(?:\s*/\s*[\d.]+)?", re.IGNORECASE)
PERCENT_PATTERN = re.compile(r"(\d{2,3}(?:\.\d+)?)\s*%")
YEAR_RANGE_PATTERN = re.compile(
    r"\b(20\d{2}|19\d{2})\s*(?:-|to|–|—)\s*(20\d{2}|present|current)\b", re.IGNORECASE
)
SINGLE_YEAR_PATTERN = re.compile(r"\b(20\d{2}|19\d{2})\b")


def parse_education(education_text: str) -> List[Dict[str, Any]]:
    """Extracts degrees, institutions, graduation dates, and GPA."""
    if not education_text:
        return []

    orgs = []
    if nlp:
        try:
            doc = nlp(education_text)
            orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
        except Exception:
            pass

    blocks = [b.strip() for b in re.split(r"\n{1,2}", education_text) if b.strip()]
    entries = []

    for block in blocks:
        lower_block = block.lower()
        degree_found = next((d for d in DEGREE_KEYWORDS if d in lower_block), None)
        institution = next((o for o in orgs if o.lower() in lower_block), None)

        if not degree_found and not institution and len(block.split()) > 15:
            continue

        cgpa_match = CGPA_PATTERN.search(block)
        percent_match = PERCENT_PATTERN.search(block)
        year_match = YEAR_RANGE_PATTERN.search(block)
        single_year = SINGLE_YEAR_PATTERN.search(block) if not year_match else None

        # Clean degree presentation
        degree_label = degree_found.title() if degree_found else "Degree / Qualification"

        entries.append({
            "raw_line": block,
            "degree": degree_label,
            "institution": institution or (block.split("|")[0].strip() if "|" in block else None),
            "cgpa": float(cgpa_match.group(1)) if cgpa_match else None,
            "percentage": float(percent_match.group(1)) if percent_match else None,
            "start_year": year_match.group(1) if year_match else None,
            "end_year": year_match.group(2) if year_match else (single_year.group(1) if single_year else None),
        })

    return entries


def parse_projects(projects_text: str, known_skill_names: List[str]) -> List[Dict[str, Any]]:
    """Extracts project titles, descriptions, and automatically identifies the tech stack."""
    if not projects_text:
        return []

    blocks = [b.strip() for b in re.split(r"\n{1,2}", projects_text) if b.strip()]
    entries = []
    skill_names_lower = {s.lower(): s for s in known_skill_names}

    i = 0
    while i < len(blocks):
        block = blocks[i]
        is_title_like = len(block.split()) <= 14 and not block.endswith(".")
        title = block if is_title_like else None
        description_lines = []

        if is_title_like:
            i += 1
            while i < len(blocks) and (len(blocks[i].split()) > 10 or blocks[i].startswith("•") or blocks[i].startswith("-")):
                description_lines.append(blocks[i])
                i += 1
        else:
            description_lines.append(block)
            i += 1

        full_desc = " ".join(description_lines) if description_lines else (title or block)
        combined_text = f"{title or ''} {full_desc}".lower()

        # Identify detected tech stack
        tech_stack = []
        for lower_skill, orig_skill in skill_names_lower.items():
            pattern = r"\b" + re.escape(lower_skill) + r"\b"
            if re.search(pattern, combined_text):
                tech_stack.append(orig_skill)

        # De-duplicate tech stack
        unique_tech = list(dict.fromkeys(tech_stack))

        entries.append({
            "title": title or (full_desc[:60] + "..." if len(full_desc) > 60 else full_desc),
            "description": full_desc,
            "tech_stack": unique_tech[:8],
        })

    return entries


ROLE_KEYWORDS = [
    "engineer", "developer", "architect", "lead", "intern", "consultant",
    "analyst", "designer", "manager", "specialist", "trainee", "associate",
    "programmer", "scientist", "administrator", "devops",
]


def parse_experience(experience_text: str, known_skill_names: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Extracts job roles, companies, dates, bullet points, and tech stacks."""
    if not experience_text:
        return []

    orgs = []
    if nlp:
        try:
            doc = nlp(experience_text)
            orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
        except Exception:
            pass

    blocks = [b.strip() for b in re.split(r"\n{1,2}", experience_text) if b.strip()]
    entries = []
    skill_names_lower = {s.lower(): s for s in (known_skill_names or [])}

    for block in blocks:
        lower_block = block.lower()
        role_found = next((r for r in ROLE_KEYWORDS if r in lower_block), None)
        institution = next((o for o in orgs if o.lower() in lower_block), None)
        year_match = YEAR_RANGE_PATTERN.search(block)

        # Tech stack mentioned in experience
        tech_stack = []
        for lower_skill, orig_skill in skill_names_lower.items():
            if re.search(r"\b" + re.escape(lower_skill) + r"\b", lower_block):
                tech_stack.append(orig_skill)

        entries.append({
            "raw_line": block,
            "role_hint": role_found.title() if role_found else "Engineering Role",
            "company": institution or (block.split("|")[0].strip() if "|" in block else None),
            "start": year_match.group(1) if year_match else None,
            "end": year_match.group(2) if year_match else None,
            "tech_stack": list(dict.fromkeys(tech_stack))[:6],
        })

    return entries
