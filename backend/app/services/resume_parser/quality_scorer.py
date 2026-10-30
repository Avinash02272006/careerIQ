import re
from typing import Dict, Any, List

ACTION_VERBS = [
    "built", "developed", "designed", "led", "created", "implemented",
    "optimized", "managed", "launched", "improved", "automated", "deployed",
    "architected", "engineered", "orchestrated", "refactored", "integrated",
    "scaled", "collaborated", "spearheaded", "accelerated", "reduced",
]

REQUIRED_SECTIONS = ["skills", "experience", "projects", "education"]


def score_resume_quality(sections: Dict[str, str], raw_text: str) -> Dict[str, Any]:
    """
    Evaluates resume quality and ATS compliance across 4 dimensions,
    returning a composite score, detailed breakdown, and actionable upgrade suggestions.
    """
    breakdown = {}
    suggestions: List[str] = []

    # 1. Section Completeness (30 points)
    present_sections = [s for s in REQUIRED_SECTIONS if sections.get(s) and len(sections[s].strip()) > 15]
    section_score = round((len(present_sections) / len(REQUIRED_SECTIONS)) * 30, 1)
    breakdown["section_completeness"] = section_score

    for req in REQUIRED_SECTIONS:
        if req not in present_sections:
            suggestions.append(f"Add a distinct '{req.title()}' section to pass standard ATS parse filters.")

    # 2. Action Verb Strength (25 points)
    lower_text = raw_text.lower()
    verb_hits = sum(1 for v in ACTION_VERBS if re.search(r"\b" + re.escape(v) + r"\b", lower_text))
    verb_score = round(min(verb_hits / 7, 1.0) * 25, 1)
    breakdown["action_verbs"] = verb_score

    if verb_hits < 5:
        suggestions.append(
            "Use high-impact action verbs (e.g., 'Architected', 'Engineered', 'Optimized', 'Automated') to begin bullet points."
        )

    # 3. Quantified Achievements & Metrics (25 points)
    # Check for %, ms, numbers with +, X reductions, etc.
    metrics_matches = re.findall(
        r"(?:\b\d+%\b|\b\d+\+\b|\b\d+\s*(?:ms|seconds|users|requests|rps|k|m)\b|\b\d{2,}\b)",
        raw_text,
        re.IGNORECASE,
    )
    metric_count = len(metrics_matches)
    metric_score = round(min(metric_count / 5, 1.0) * 25, 1)
    breakdown["quantified_impact"] = metric_score

    if metric_count < 3:
        suggestions.append(
            "Quantify your accomplishments with measurable outcomes (e.g., 'reduced API latency by 35%', 'handled 15k+ daily users')."
        )

    # 4. Keyword & Tech Stack Density (20 points)
    word_count = len(raw_text.split())
    if 250 <= word_count <= 950:
        length_score = 20.0
    elif 150 <= word_count < 250 or 950 < word_count <= 1400:
        length_score = 14.0
    else:
        length_score = 8.0
        suggestions.append("Adjust resume length: ideal engineering resumes are 350-800 words.")

    breakdown["keyword_density"] = length_score

    # Check for GitHub / Portfolio presence
    if "github" not in lower_text and "linkedin" not in lower_text:
        suggestions.append("Include clickable links to your GitHub and LinkedIn profiles in your contact header.")

    total_score = round(min(section_score + verb_score + metric_score + length_score, 100.0), 1)

    return {
        "overall_score": total_score,
        "breakdown": breakdown,
        "suggestions": suggestions,
        "metrics_found_count": metric_count,
        "action_verbs_count": verb_hits,
        "word_count": word_count,
    }
