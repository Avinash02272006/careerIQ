from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.groq_service import (
    generate_aptitude_and_technical_quiz,
    call_groq_chat
)

router = APIRouter(prefix="/practice", tags=["practice"])


class QuizRequest(BaseModel):
    track: Optional[str] = "AI & Data Science (AIDS)"
    topic: Optional[str] = "All"
    difficulty: Optional[str] = "Medium"
    count: Optional[int] = 5


class SubmitQuizRequest(BaseModel):
    answers: Dict[str, int]  # question_id -> selected_index
    questions: List[Dict[str, Any]]


class AskAIProblemRequest(BaseModel):
    query: str
    track: Optional[str] = "AI & Data Science"


@router.get("/quiz")
def get_practice_quiz(
    track: Optional[str] = "AI & Data Science (AIDS)",
    topic: Optional[str] = "All",
    difficulty: Optional[str] = "Medium",
    count: Optional[int] = 5
):
    """
    Generates dynamic aptitude, quantitative, logical, and technical MCQs tailored for
    AI & Data Science (AIDS) and Engineering students preparing for placements.
    """
    questions = generate_aptitude_and_technical_quiz(
        track=track,
        topic=topic,
        difficulty=difficulty,
        count=min(max(count, 3), 10)
    )
    return {
        "track": track,
        "topic": topic,
        "difficulty": difficulty,
        "total_questions": len(questions),
        "questions": questions
    }


@router.post("/submit")
def submit_practice_quiz(payload: SubmitQuizRequest):
    """
    Evaluates quiz answers, provides instant grading, explanations, and key shortcut formulas.
    """
    total = len(payload.questions)
    if total == 0:
        raise HTTPException(status_code=400, detail="No questions provided")

    correct_count = 0
    results = []

    for q in payload.questions:
        q_id = q.get("id")
        correct_idx = q.get("correct_index", 0)
        selected_idx = payload.answers.get(q_id, -1)
        is_correct = (selected_idx == correct_idx)

        if is_correct:
            correct_count += 1

        results.append({
            "id": q_id,
            "question": q.get("question"),
            "topic": q.get("topic"),
            "selected_index": selected_idx,
            "correct_index": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation"),
            "shortcut_formula": q.get("shortcut_formula")
        })

    score_pct = int((correct_count / total) * 100)

    verdict = (
        "Exceptional Mastery! Placement Ready." if score_pct >= 85
        else "Strong Performance! Ready for Technical Rounds." if score_pct >= 70
        else "Good Effort. Review the shortcut formulas and retry." if score_pct >= 50
        else "Needs Targeted Practice in Foundational Math & Concepts."
    )

    return {
        "score_percentage": score_pct,
        "correct_count": correct_count,
        "total_questions": total,
        "verdict": verdict,
        "breakdown": results
    }


@router.post("/ask-ai")
def ask_ai_problem_solver(payload: AskAIProblemRequest):
    """
    AI Doubt Solver for AIDS and Tech students:
    Solves complex aptitude, probability, ML algorithms, or coding questions with step-by-step reasoning.
    """
    user_query = payload.query.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    system_prompt = (
        "You are an elite AI & Data Science Professor and Quantitative Aptitude Mentor. "
        "Solve the user's problem with exceptional clarity, mathematical rigor, and step-by-step logic. "
        "Include:\n"
        "1. Core concept or mathematical principle\n"
        "2. Step-by-step derivation or code implementation\n"
        "3. Shortcut formula or 30-second trick for competitive tests\n"
        "4. Common pitfalls or trap options"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Track: {payload.track}\nQuestion: {user_query}"}
    ]

    try:
        explanation = call_groq_chat(messages, temperature=0.3, max_tokens=1500)
        return {
            "query": user_query,
            "track": payload.track,
            "ai_solution": explanation
        }
    except Exception as e:
        return {
            "query": user_query,
            "track": payload.track,
            "ai_solution": "AI Service currently busy. Please review standard formulas for this topic."
        }

