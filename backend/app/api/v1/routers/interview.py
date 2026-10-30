import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.deps import get_current_user_or_guest
from app.db.models.user import User

router = APIRouter(prefix="/interview", tags=["interview"])

# Structured question bank by role & category
QUESTION_BANK = {
    "role-fs": [
        {
            "id": "fs-q1",
            "title": "Architecting an API Gateway & Microservice Authentication",
            "category": "System Design",
            "difficulty": "Mid-Senior",
            "role": "Full Stack Developer",
            "question": "How would you design a scalable authentication flow for a microservices architecture using JWT tokens, refresh token rotation, and an API Gateway? How do you handle token revocation?",
            "hints": [
                "Consider stateless access tokens vs stateful refresh tokens stored in Redis.",
                "Discuss API Gateway signature verification (public key / JWKS).",
                "Explain how blacklists / revocation lists can be checked with minimal latency."
            ],
            "key_concepts": ["JWT", "Redis", "API Gateway", "Token Rotation", "JWKS", "Rate Limiting"],
            "model_answer": "In a distributed system, the API Gateway validates short-lived asymmetric JWTs (15 mins) using a public key cached from an auth service JWKS endpoint, avoiding service-to-service roundtrips. For refresh tokens (7 days), store hashed tokens in Redis tied to the user device session. Upon refresh, issue a new pair and rotate the token family; if an old refresh token is reused, revoke the entire family immediately to prevent replay attacks."
        },
        {
            "id": "fs-q2",
            "title": "React State Management & Performance Optimization",
            "category": "Frontend Architecture",
            "difficulty": "Mid",
            "role": "Full Stack Developer",
            "question": "Explain the difference between client-side rendering bottlenecks and hydration lag in React 19 / Next.js. What techniques (e.g. memoization, virtualization, streaming) would you apply to render a list of 100,000 items with live updates?",
            "hints": [
                "Mention windowing/virtualization (react-window or tanstack virtual).",
                "Discuss offloading state updates outside the main thread or using concurrent features (useTransition).",
                "Consider WebSocket throttling and batching."
            ],
            "key_concepts": ["React 19", "Virtualization", "useTransition", "Hydration", "Batching", "WebSockets"],
            "model_answer": "Rendering 100k DOM nodes freezes the main thread. We solve this by virtualizing the viewport (only rendering visible rows plus an overscan buffer of ~5 items). For high-frequency WebSocket updates, batch updates via requestAnimationFrame or Zustand throttle to prevent rerendering 60 times a second. In Next.js, leverage React Server Components for static portions and Suspense boundaries for streaming chunks."
        },
        {
            "id": "fs-q3",
            "title": "Database Query Optimization & Connection Pooling",
            "category": "Backend & Database",
            "difficulty": "Mid-Senior",
            "role": "Full Stack Developer",
            "question": "You observe a PostgreSQL database experiencing 100% CPU usage during peak traffic on a query with multiple JOINs and a LIKE '%search%' clause. How do you diagnose and resolve this?",
            "hints": [
                "Use EXPLAIN ANALYZE to identify sequential scans.",
                "Explain why B-Tree indexes fail on leading wildcards and how GIN / trigram indexes (pg_trgm) help.",
                "Discuss read replicas and connection poolers like PgBouncer."
            ],
            "key_concepts": ["EXPLAIN ANALYZE", "pg_trgm", "GIN Index", "PgBouncer", "Indexing", "Read Replicas"],
            "model_answer": "First run EXPLAIN ANALYZE to check whether PostgreSQL is executing sequential table scans. Leading wildcards (LIKE '%text%') bypass standard B-Tree indexes; we resolve this by enabling the pg_trgm extension and building a GIN/GiST trigram index on the search columns. If connection starvation occurs, deploy PgBouncer in transaction pooling mode, and offload read-heavy reporting queries to a read replica."
        }
    ],
    "role-fe": [
        {
            "id": "fe-q1",
            "title": "Modern Component Design Patterns & Accessibility (a11y)",
            "category": "Frontend Engineering",
            "difficulty": "Mid",
            "role": "Frontend Developer",
            "question": "How do you design a reusable, headless combobox (autocomplete) component in React that supports keyboard navigation (Arrow keys, Escape, Enter), screen reader announcements (ARIA attributes), and outside click dismissal?",
            "hints": [
                "Discuss role='combobox', aria-expanded, aria-autocomplete, and aria-activedescendant.",
                "Explain how ref management handles roving tabindex.",
                "Describe cleanup with document click listeners."
            ],
            "key_concepts": ["ARIA", "Combobox", "Keyboard Nav", "Roving Tabindex", "useRef", "Custom Hooks"],
            "model_answer": "A robust accessible combobox uses role='combobox' with aria-expanded and aria-haspopup='listbox'. Instead of moving focus to every option DOM node, use aria-activedescendant pointing to the highlighted item id to preserve input focus. Manage keyboard events for ArrowUp/Down to update activeIndex, Enter to commit selection, and Escape to close. Add a useEffect outside-click listener with proper ref cleanup."
        },
        {
            "id": "fe-q2",
            "title": "Web Performance & Core Web Vitals (LCP, INP, CLS)",
            "category": "Performance",
            "difficulty": "Senior",
            "role": "Frontend Developer",
            "question": "Explain what Interaction to Next Paint (INP) measures and how it differs from FID. What common JavaScript architecture pitfalls degrade INP, and how do you remediate them?",
            "hints": [
                "INP covers the entire page lifecycle, assessing the 98th percentile longest interaction.",
                "Long tasks on the main thread (>50ms) delay paint.",
                "Mention scheduler.yield() or useTransition to break up work."
            ],
            "key_concepts": ["INP", "Core Web Vitals", "Main Thread", "Long Tasks", "scheduler.yield()", "Web Workers"],
            "model_answer": "Unlike First Input Delay which only tracked the initial click latency, INP measures user interaction responsiveness across the entire session. High INP is caused by long JavaScript tasks (>50ms) blocking layout and paint. To fix this: break up complex synchronous loops using modern scheduler.yield() or requestIdleCallback, defer heavy computations to Web Workers, and avoid large synchronous DOM reflows."
        }
    ],
    "role-be": [
        {
            "id": "be-q1",
            "title": "Idempotency & Distributed Transaction Consistency",
            "category": "Backend Engineering",
            "difficulty": "Mid-Senior",
            "role": "Backend Developer",
            "question": "How do you guarantee idempotency in a payment processing REST API when network timeouts cause client retries? How would you implement this using Redis or database locking?",
            "hints": [
                "Clients send an Idempotency-Key header.",
                "Store the key with an atomic SETNX or DB unique constraint before processing.",
                "Cache the final response payload with a TTL."
            ],
            "key_concepts": ["Idempotency-Key", "Redis SETNX", "Distributed Locks", "Atomic Operations", "Transactions"],
            "model_answer": "The client passes a unique UUID in the Idempotency-Key HTTP header. The backend executes an atomic Redis command: SET idempotency:{key} 'PROCESSING' NX EX 300. If the key already exists and status is 'PROCESSING', return HTTP 409 Conflict or poll. If the status is 'COMPLETED', immediately return the cached response. When completed, store the processed transaction and update the Redis key with the HTTP response."
        },
        {
            "id": "be-q2",
            "title": "High-Throughput Message Queues & Event-Driven Systems",
            "category": "System Design",
            "difficulty": "Senior",
            "role": "Backend Developer",
            "question": "Compare Apache Kafka, RabbitMQ, and Redis Streams. In what scenarios would you choose each, and how do you prevent consumer lag and poison-pill messages?",
            "hints": [
                "Kafka: distributed append-only log with partitioned replayability.",
                "RabbitMQ: AMQP broker with complex routing (exchange/queue bindings).",
                "Poison pills: Dead Letter Queues (DLQ) with exponential backoff."
            ],
            "key_concepts": ["Kafka", "RabbitMQ", "Dead Letter Queue", "Consumer Lag", "Event-Driven", "Backoff"],
            "model_answer": "Use RabbitMQ for traditional transactional messaging requiring complex routing keys and per-message ACKs. Use Kafka for high-throughput stream processing where event ordering and retention/replayability are required. Use Redis Streams for lightweight pub/sub with sub-millisecond in-memory latency. For poison pills, implement a Dead Letter Queue (DLQ) with max retries and exponential backoff so failing messages do not starve healthy consumers."
        }
    ],
    "role-devops": [
        {
            "id": "devops-q1",
            "title": "Zero-Downtime Deployments & Kubernetes Pod Lifecycles",
            "category": "Cloud & Infrastructure",
            "difficulty": "Senior",
            "role": "DevOps & Cloud Engineer",
            "question": "Explain how Kubernetes RollingUpdate works with Readiness and Liveness probes. How do you prevent 502 Bad Gateway errors during pod termination?",
            "hints": [
                "Readiness probes determine when traffic is routed via endpoints.",
                "Liveness probes restart hung containers.",
                "Pod termination sends SIGTERM; explain preStop hooks and connection draining."
            ],
            "key_concepts": ["Kubernetes", "Readiness Probe", "Liveness Probe", "SIGTERM", "preStop Hook", "RollingUpdate"],
            "model_answer": "During a rollout, new pods are only added to Service Endpoints after passing the readiness probe. On pod termination, Kubelet sends SIGTERM while asynchronously updating endpoint slices. If the app shuts down instantly, iptables may still route active requests, causing 502s. Fix this by adding a preStop hook with 'sleep 5' to allow existing connections to drain gracefully before the process exits."
        }
    ],
    "role-ai": [
        {
            "id": "ai-q1",
            "title": "LLM Inference Optimization & Retrieval-Augmented Generation (RAG)",
            "category": "AI & Machine Learning",
            "difficulty": "Senior",
            "role": "AI & Machine Learning Engineer",
            "question": "How do you evaluate and optimize a production RAG pipeline experiencing hallucinations and high latency? Discuss chunking strategies, vector embeddings, reranking, and semantic caching.",
            "hints": [
                "Chunking: recursive character split with sentence boundary awareness.",
                "Embeddings + Cross-Encoder reranking (e.g. Cohere / BGE).",
                "Semantic caching with Redis or pgvector to avoid redundant LLM calls."
            ],
            "key_concepts": ["RAG", "Vector Search", "Reranker", "Semantic Cache", "Hallucination Mitigation", "pgvector"],
            "model_answer": "To eliminate hallucinations: use recursive hierarchical chunking (300-500 tokens with 10% overlap), generate dense embeddings, and retrieve top-20 documents followed by a cross-encoder reranker to extract the top-3 most relevant chunks. Implement semantic caching with pgvector/Redis to return instant results for common prompts. Employ Ragas or TruLens evaluation metrics (faithfulness, context relevance) to benchmark accuracy."
        }
    ]
}

class EvaluateRequest(BaseModel):
    role_id: str
    question_id: str
    question_text: str
    user_answer: str
    category: Optional[str] = "Technical"

@router.get("/questions")
def get_questions(
    role: Optional[str] = "role-fs",
    category: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """
    Returns curated mock interview questions tailored to the candidate's target role.
    """
    bank = QUESTION_BANK.get(role, QUESTION_BANK["role-fs"])
    
    # Also include questions from fallback if list is short
    if len(bank) < 2 and role != "role-fs":
        bank = bank + QUESTION_BANK["role-fs"]

    filtered = bank
    if category and category != "All":
        filtered = [q for q in filtered if category.lower() in q.get("category", "").lower()]
    if difficulty and difficulty != "All":
        filtered = [q for q in filtered if difficulty.lower() in q.get("difficulty", "").lower()]

    return {
        "role": role,
        "total_available": len(filtered),
        "questions": filtered if filtered else bank
    }

@router.post("/evaluate")
def evaluate_answer(
    payload: EvaluateRequest,
    current_user: User = Depends(get_current_user_or_guest)
):
    """
    Evaluates candidate's response using multi-factor technical analysis,
    keyword coverage, depth heuristics, and clarity scoring.
    """
    answer = payload.user_answer.strip()
    if len(answer) < 20:
        return {
            "score": 35,
            "technical_score": 30,
            "clarity_score": 45,
            "completeness_score": 30,
            "verdict": "Needs Elaboration",
            "feedback": "The response was too brief. In a technical interview, aim to provide concrete architectural decisions, trade-offs, and implementation details.",
            "strengths": ["Clear initial intent"],
            "improvements": [
                "Elaborate on edge cases and failure modes",
                "Explain the 'why' behind chosen technologies",
                "Mention scalability and latency metrics"
            ],
            "model_answer": "Structure your answer using the STAR or Architecture-Tradeoff framework: 1) System Requirements, 2) Component Selection, 3) Failure Handling, 4) Real-world optimization."
        }

    # Identify matching question metadata
    matching_q = None
    for role_questions in QUESTION_BANK.values():
        for q in role_questions:
            if q["id"] == payload.question_id:
                matching_q = q
                break
        if matching_q:
            break

    expected_concepts = matching_q["key_concepts"] if matching_q else [
        "Scalability", "Architecture", "Optimization", "Security", "Testing", "Performance"
    ]

    matched_concepts = [c for c in expected_concepts if c.lower() in answer.lower()]
    concept_ratio = len(matched_concepts) / max(len(expected_concepts), 1)

    # Word count heuristic
    word_count = len(answer.split())
    depth_multiplier = min(word_count / 120.0, 1.0)

    # Calculate subscores
    tech_score = int(min(100, max(45, (concept_ratio * 65) + (depth_multiplier * 35))))
    clarity_score = int(min(98, max(55, 70 + (10 if word_count > 60 else -10) + (10 if "." in answer else 0))))
    completeness_score = int(min(95, max(40, (concept_ratio * 50) + (depth_multiplier * 50))))
    
    overall_score = int((tech_score * 0.45) + (completeness_score * 0.35) + (clarity_score * 0.20))

    strengths = []
    if matched_concepts:
        strengths.append(f"Demonstrated familiarity with key concepts: {', '.join(matched_concepts[:4])}")
    if word_count > 80:
        strengths.append("Provided thorough technical explanation with substantial detail")
    else:
        strengths.append("Concise and direct communication style")

    improvements = []
    missing_concepts = [c for c in expected_concepts if c not in matched_concepts]
    if missing_concepts:
        improvements.append(f"Incorporate discussion on: {', '.join(missing_concepts[:3])}")
    if word_count < 75:
        improvements.append("Expand on trade-offs and operational failure recovery strategies")
    improvements.append("Highlight production metrics or benchmarks from personal experience")

    verdict = "Excellent Candidate" if overall_score >= 85 else ("Strong Response" if overall_score >= 70 else "Developing Competency")

    return {
        "score": overall_score,
        "technical_score": tech_score,
        "clarity_score": clarity_score,
        "completeness_score": completeness_score,
        "verdict": verdict,
        "word_count": word_count,
        "matched_concepts": matched_concepts,
        "missing_concepts": missing_concepts[:3],
        "strengths": strengths,
        "improvements": improvements,
        "model_answer": matching_q["model_answer"] if matching_q else "A senior engineer structures their answer around constraints, scalability, and measurable performance wins.",
        "feedback": f"Your response earned an overall score of {overall_score}%. {strengths[0]}."
    }

@router.get("/categories")
def get_categories():
    return [
        {"id": "all", "name": "All Categories"},
        {"id": "System Design", "name": "System Design & Distributed Systems"},
        {"id": "Frontend Architecture", "name": "Frontend & UI Architecture"},
        {"id": "Backend Engineering", "name": "Backend Services & Databases"},
        {"id": "Performance", "name": "Performance & Scalability"},
        {"id": "Cloud & Infrastructure", "name": "DevOps & Cloud Infrastructure"},
        {"id": "AI & Machine Learning", "name": "Machine Learning & AI Engineering"}
    ]

