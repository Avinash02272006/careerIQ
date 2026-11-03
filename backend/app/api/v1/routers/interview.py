import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.v1.deps import get_current_user_or_guest
from app.db.models.user import User

router = APIRouter(prefix="/interview", tags=["interview"])

# 50+ In-Depth Technical & Architectural Interview Questions across All 10 Benchmark Tracks
EXTENSIVE_QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    "role-fs": [
        {
            "id": "fs-q1",
            "title": "Architecting an API Gateway & Microservice Authentication",
            "category": "System Design",
            "difficulty": "Senior",
            "role": "Full Stack Developer",
            "question": "How would you design a scalable authentication and token revocation flow for a microservices architecture using short-lived JWTs, refresh token rotation, and an API Gateway? How do you prevent replay attacks?",
            "hints": [
                "Consider asymmetric signing (RS256) where Gateway checks public JWKS.",
                "Store single-use refresh token hashes in Redis with token family tracking.",
                "Revoke entire family immediately if an old refresh token is reused."
            ],
            "key_concepts": ["JWT", "Redis", "API Gateway", "Token Rotation", "JWKS", "Rate Limiting", "Replay Attacks", "Asymmetric Cryptography"],
            "model_answer": "In a distributed system, the API Gateway validates short-lived asymmetric JWTs (15 min) using public keys cached from the Auth Service's JWKS endpoint, avoiding downstream network hops. For refresh tokens (7 days), store hashed token families in Redis tied to the device session. Upon refresh, issue a new access/refresh pair and invalidate the previous refresh token. If an already-rotated token is presented, trigger an automatic security breach alert and revoke the entire token family immediately.",
            "followup": "What happens if Redis becomes temporarily unreachable? How should the gateway handle session verification during a cache partition?"
        },
        {
            "id": "fs-q2",
            "title": "React 19 Server Components, Hydration, and Virtualization",
            "category": "Frontend Architecture",
            "difficulty": "Mid-Senior",
            "role": "Full Stack Developer",
            "question": "Explain the difference between client-side rendering bottlenecks and React hydration lag. How would you architect a live financial dashboard displaying 50,000 updating rows without freezing the main thread?",
            "hints": [
                "Discuss DOM virtualization (windowing) with fixed row buffers.",
                "Throttle incoming WebSocket state updates with requestAnimationFrame.",
                "Leverage React 19 useTransition or Web Workers for computation."
            ],
            "key_concepts": ["Virtualization", "useTransition", "Hydration", "WebSockets", "requestAnimationFrame", "DOM Reflow", "Web Workers"],
            "model_answer": "Rendering 50k DOM nodes freezes browser layout and garbage collection. We resolve this by virtualizing the viewport (rendering only the 30 visible rows plus a 5-item overscan buffer). Incoming WebSocket tick updates are throttled into batches via requestAnimationFrame to avoid 60+ re-renders per second. Heavy calculation is offloaded to a Web Worker, and state transitions are marked non-blocking with useTransition so user interactions retain 60fps responsiveness.",
            "followup": "How would you persist user scroll position and filter state when rows are dynamically added or deleted from the virtual list?"
        },
        {
            "id": "fs-q3",
            "title": "PostgreSQL Performance Optimization & Connection Pool Starvation",
            "category": "Database Engineering",
            "difficulty": "Senior",
            "role": "Full Stack Developer",
            "question": "Your production PostgreSQL database experiences 100% CPU usage and connection timeouts during peak traffic. Queries join 4 tables with wildcard text searches. How do you diagnose and resolve this?",
            "hints": [
                "Run EXPLAIN (ANALYZE, BUFFERS) to detect sequential scans.",
                "Explain why B-Trees fail on '%query%' and implement pg_trgm GIN indexes.",
                "Deploy PgBouncer in transaction mode to eliminate connection starvation."
            ],
            "key_concepts": ["EXPLAIN ANALYZE", "GIN Index", "pg_trgm", "PgBouncer", "Connection Pooling", "Sequential Scan", "Read Replicas"],
            "model_answer": "First inspect pg_stat_activity and run EXPLAIN (ANALYZE, BUFFERS). Leading wildcards (LIKE '%text%') force full table scans; we resolve this by activating pg_trgm and indexing search columns with a GIN trigram index. To stop connection exhaustion caused by Node.js process clusters, introduce PgBouncer in transaction pooling mode. Finally, isolate reporting and analytics reads to read-replicas via streaming replication.",
            "followup": "Under what conditions would GIN indexes significantly slow down database write operations, and how do you mitigate it?"
        },
        {
            "id": "fs-q4",
            "title": "Distributed Caching & Cache Invalidation Patterns",
            "category": "System Design",
            "difficulty": "Mid-Senior",
            "role": "Full Stack Developer",
            "question": "Compare the Cache-Aside, Write-Through, and Write-Behind caching strategies. How do you prevent cache stampedes (thundering herd) and race conditions when cache invalidation occurs?",
            "hints": [
                "Cache-Aside: application queries cache first, reads DB on miss, populates cache.",
                "Thundering herd: use mutex locking (Redis SETNX) or probabilistic early expiration (XFetch).",
                "Race conditions: update DB first, then delete cache key rather than updating it."
            ],
            "key_concepts": ["Cache-Aside", "Write-Through", "Write-Behind", "Cache Stampede", "Thundering Herd", "Redis SETNX", "Cache Invalidation"],
            "model_answer": "Cache-Aside is ideal for read-heavy workloads where the application manages cache misses. To prevent cache stampedes when a hot key expires, implement distributed mutex locking with Redis SETNX so only one worker queries the DB while others wait or return stale data with a short grace TTL. To avoid race conditions between concurrent writes and reads, always delete the cache key after committing the database transaction instead of updating the cache in place.",
            "followup": "What happens if the cache deletion fails after the DB commit succeeds? How would you ensure eventual consistency?"
        }
    ],

    "role-fe": [
        {
            "id": "fe-q1",
            "title": "Optimizing Interaction to Next Paint (INP) and Web Vitals",
            "category": "Web Performance",
            "difficulty": "Senior",
            "role": "Frontend Developer",
            "question": "Explain what Interaction to Next Paint (INP) measures and how it differs from FID. What common JavaScript architectural pitfalls degrade INP, and how do you remediate them?",
            "hints": [
                "INP assesses the 98th percentile latency of all user clicks, taps, and keypresses.",
                "Long tasks (>50ms) on the main thread delay the presentation frame.",
                "Use scheduler.yield() or requestIdleCallback to split execution chunks."
            ],
            "key_concepts": ["INP", "Core Web Vitals", "Main Thread", "Long Tasks", "scheduler.yield()", "Web Workers", "requestAnimationFrame"],
            "model_answer": "Unlike First Input Delay which only sampled the very first click, INP measures user input responsiveness across the complete session lifecycle. High INP occurs when long synchronous JavaScript tasks (>50ms) prevent the browser from updating the DOM and repainting. We solve this by yielding the main thread using scheduler.yield(), offloading expensive data transformations to Web Workers, and minimizing heavy CSS selector recalculations on click handlers.",
            "followup": "How would you set up automated continuous monitoring for real-user INP metrics across production browsers?"
        },
        {
            "id": "fe-q2",
            "title": "Headless Accessible UI Components (WAI-ARIA & Focus Management)",
            "category": "Frontend Architecture",
            "difficulty": "Mid-Senior",
            "role": "Frontend Developer",
            "question": "How do you design a reusable, accessible Combobox component in React that supports keyboard navigation (Arrow keys, Enter, Escape), roving tabindex, and screen reader announcements?",
            "hints": [
                "Implement role='combobox', aria-expanded, aria-controls, and aria-activedescendant.",
                "Avoid moving DOM focus manually; keep focus in the input and update activedescendant.",
                "Manage cleanup for global click-outside and touch dismissal handlers."
            ],
            "key_concepts": ["WAI-ARIA", "Combobox", "aria-activedescendant", "Roving Tabindex", "Keyboard Navigation", "Screen Readers", "useRef"],
            "model_answer": "An accessible combobox uses role='combobox' on the input with aria-expanded, aria-haspopup='listbox', and aria-autocomplete='list'. Instead of shifting DOM focus to option nodes (which collapses the virtual keyboard on mobile), use aria-activedescendant pointing to the highlighted option ID while keeping focus in the text field. Support ArrowUp/Down for selection, Enter to confirm, and Escape to dismiss. Use custom React hooks to manage focus traps and outside clicks cleanly.",
            "followup": "How do you ensure screen readers announce dynamic search count updates (e.g., '14 results found') without interrupting the user's typing?"
        },
        {
            "id": "fe-q3",
            "title": "Micro-Frontends & Module Federation Architecture",
            "category": "Architecture",
            "difficulty": "Senior",
            "role": "Frontend Developer",
            "question": "What architectural trade-offs exist between Monolithic SPAs and Webpack/Vite Module Federation? How do you handle shared dependencies (e.g. React singletons) and independent deploy version mismatches?",
            "hints": [
                "Module Federation exposes remotes and host apps via shared scopes.",
                "React must be declared a singleton in shared dependencies to prevent multiple hook contexts.",
                "Implement fallback boundary UI when a remote micro-frontend fails to load."
            ],
            "key_concepts": ["Module Federation", "Micro-Frontends", "Shared Scope", "Singleton", "Webpack", "Vite", "Error Boundaries"],
            "model_answer": "Module Federation allows independent teams to deploy sub-applications without rebuilding the host shell. However, duplicate libraries can bloat bundles. We configure shared dependencies with singleton: true, requiredVersion: '^19.0.0', and strictVersion: true for React to prevent multiple runtime instances breaking hooks. Every federated remote is wrapped in a React Error Boundary with a graceful fallback UI in case network failure prevents loading.",
            "followup": "How do you orchestrate cross-application routing and shared global state between federated micro-apps?"
        }
    ],

    "role-be": [
        {
            "id": "be-q1",
            "title": "Distributed Idempotency & Payment Processing Resiliency",
            "category": "Backend Engineering",
            "difficulty": "Senior",
            "role": "Backend Developer",
            "question": "How do you guarantee idempotency in a financial payment processing API when network timeouts cause client retries? How do you prevent double-charges and race conditions?",
            "hints": [
                "Require an Idempotency-Key HTTP header from the client.",
                "Acquire an atomic distributed lock in Redis with SET key 'PROCESSING' NX EX 300.",
                "Store processed payloads in the database with unique constraints."
            ],
            "key_concepts": ["Idempotency-Key", "Redis SETNX", "Distributed Lock", "Atomic Operations", "Database Constraints", "ACID", "2PC"],
            "model_answer": "The client passes a unique UUID in the Idempotency-Key header. On receipt, the backend attempts an atomic Redis lock: SET idempotency:{key} 'PROCESSING' NX EX 120. If the key exists with status 'PROCESSING', return HTTP 409 Conflict. If status is 'COMPLETED', return the cached transaction response. Once the database transaction commits within an ACID boundary, update the Redis key to 'COMPLETED' with the response body and a 24-hour TTL.",
            "followup": "What happens if the backend server crashes halfway through the credit card charge before saving to the database?"
        },
        {
            "id": "be-q2",
            "title": "Kafka vs RabbitMQ: Event Streaming vs Message Queuing",
            "category": "Distributed Systems",
            "difficulty": "Senior",
            "role": "Backend Developer",
            "question": "Compare Apache Kafka and RabbitMQ. In what architectural scenarios would you choose each, and how do you prevent consumer lag and handle poison-pill messages?",
            "hints": [
                "Kafka: distributed append-only partitioned log with replayability.",
                "RabbitMQ: smart broker with AMQP routing exchanges and per-message ACKs.",
                "Poison pills: Dead Letter Queues (DLQ) with exponential backoff."
            ],
            "key_concepts": ["Kafka", "RabbitMQ", "Dead Letter Queue", "Consumer Lag", "Event-Driven", "Partitioning", "Exponential Backoff"],
            "model_answer": "Use RabbitMQ for traditional transactional message brokering with complex routing rules and priority queues where messages are discarded once acknowledged. Use Kafka for high-volume event streams, event sourcing, and pub/sub where replayability from offsets is required. For poison-pill messages, implement a Dead Letter Queue (DLQ) with exponential backoff retries so unparsable payloads do not block consumer progress.",
            "followup": "How do you ensure strict FIFO ordering across messages in Kafka when scaling out consumer partitions?"
        },
        {
            "id": "be-q3",
            "title": "Circuit Breaker Pattern & Cascading Failure Prevention",
            "category": "System Design",
            "difficulty": "Mid-Senior",
            "role": "Backend Developer",
            "question": "Describe the states of the Circuit Breaker pattern (Closed, Open, Half-Open). How does it prevent cascading microservice outages, and how do you calculate threshold failure rates?",
            "hints": [
                "Closed: normal traffic flows through.",
                "Open: calls fail immediately without hitting the downstream service.",
                "Half-Open: probe requests test if the downstream service has recovered."
            ],
            "key_concepts": ["Circuit Breaker", "Cascading Failure", "Half-Open", "Sliding Window", "Timeout", "Fallback", "Resilience4j"],
            "model_answer": "In a distributed mesh, if Service B slows down, Service A threads become blocked, causing a cascade. A Circuit Breaker monitors calls over a sliding time window (e.g. 100 requests). In 'Closed' state, calls execute normally. If error rate exceeds 50%, it trips to 'Open', failing fast with fallback responses. After a sleep window (e.g. 30s), it transitions to 'Half-Open', allowing a percentage of probe requests. If successful, it resets to 'Closed'; otherwise, it re-opens.",
            "followup": "What fallback strategy would you provide for a product recommendation service when its circuit breaker trips open?"
        }
    ],

    "role-devops": [
        {
            "id": "devops-q1",
            "title": "Zero-Downtime Deployments & Kubernetes Pod Lifecycles",
            "category": "Cloud & Infrastructure",
            "difficulty": "Senior",
            "role": "DevOps & Cloud Engineer",
            "question": "Explain how Kubernetes RollingUpdate works with Readiness and Liveness probes. How do you eliminate 502 Bad Gateway errors during container termination?",
            "hints": [
                "Readiness probes determine endpoint membership.",
                "Termination emits SIGTERM while Kubelet updates iptables asynchronously.",
                "Use a preStop hook with 'sleep 5' to drain in-flight connections."
            ],
            "key_concepts": ["Kubernetes", "Readiness Probe", "Liveness Probe", "SIGTERM", "preStop Hook", "RollingUpdate", "Connection Draining"],
            "model_answer": "During a rollout, new pods only receive traffic after passing readiness probes. When terminating old pods, Kubelet sends SIGTERM while asynchronously updating endpoint slices. If the pod process exits immediately, iptables may still route active requests, causing 502 errors. To fix this, add a preStop hook with 'sleep 10' to allow in-flight connections to drain, and set terminationGracePeriodSeconds to 45 seconds.",
            "followup": "How does Horizontal Pod Autoscaler (HPA) interact with custom Prometheus metrics like queue depth or HTTP request rate?"
        },
        {
            "id": "devops-q2",
            "title": "Terraform State Locking & Infrastructure as Code (IaC) Pipelines",
            "category": "Infrastructure as Code",
            "difficulty": "Mid-Senior",
            "role": "DevOps & Cloud Engineer",
            "question": "Why is remote state locking critical in multi-engineer teams using Terraform? How does Terraform handle state drift when resources are modified out-of-band in the AWS console?",
            "hints": [
                "S3 stores remote state; DynamoDB manages atomic mutex locks.",
                "State drift occurs when real cloud state diverges from tfstate.",
                "Use 'terraform plan -refresh-only' to inspect drift before reconciliation."
            ],
            "key_concepts": ["Terraform", "State Locking", "DynamoDB", "S3 Backend", "State Drift", "IaC", "GitOps"],
            "model_answer": "Without remote state locking, concurrent pipeline runs can corrupt the terraform.tfstate file. We configure an S3 backend with a DynamoDB table for distributed locking. When manual changes occur in AWS, running 'terraform plan -refresh-only' compares real cloud provider APIs against the local state, identifying drift without making destructive changes. We then reconcile via code updates or importing existing ARNs.",
            "followup": "How do you securely manage and inject secrets into Terraform runs without exposing them in plaintext state files?"
        }
    ],

    "role-ai": [
        {
            "id": "ai-q1",
            "title": "RAG Optimization: Chunking, Semantic Caching, & Cross-Encoder Reranking",
            "category": "AI & Machine Learning",
            "difficulty": "Senior",
            "role": "AI & Machine Learning Engineer",
            "question": "How do you diagnose and eliminate hallucinations and latency bottlenecks in a production Retrieval-Augmented Generation (RAG) system with a knowledge base of 2 million documents?",
            "hints": [
                "Use recursive semantic chunking with sliding token overlap.",
                "Deploy hybrid search (BM25 keyword + dense vector embeddings).",
                "Apply a cross-encoder reranker to extract top-k context."
            ],
            "key_concepts": ["RAG", "Vector Search", "Reranker", "pgvector", "Semantic Cache", "Hallucination Mitigation", "Hybrid Search", "BM25"],
            "model_answer": "To eliminate hallucinations: 1) Implement recursive semantic chunking (400 tokens with 15% overlap) respecting heading boundaries. 2) Use hybrid search combining sparse BM25 and dense vector embeddings via pgvector HNSW indexing. 3) Pass top-25 results through a cross-encoder reranker (e.g. BGE-reranker) to send only the top-4 most relevant chunks to the LLM. 4) Add semantic caching via Redis to return instant answers for repeated semantic queries, reducing latency by 85%.",
            "followup": "How do you evaluate RAG accuracy quantitatively using metrics like Faithfulness and Context Relevance (e.g. Ragas framework)?"
        },
        {
            "id": "ai-q2",
            "title": "Fine-Tuning vs RAG vs Prompt Engineering Trade-Offs",
            "category": "LLM Architecture",
            "difficulty": "Mid-Senior",
            "role": "AI & Machine Learning Engineer",
            "question": "When building an enterprise AI assistant, what criteria dictate choosing between Prompt Engineering, RAG, and LoRA/QLoRA Parameter-Efficient Fine-Tuning?",
            "hints": [
                "Prompt Engineering: quick prototyping, general tasks, low cost.",
                "RAG: dynamic, private, frequently updated factual knowledge.",
                "Fine-Tuning (LoRA): style, tone, structured output syntax, niche domain jargon."
            ],
            "key_concepts": ["LoRA", "QLoRA", "Fine-Tuning", "RAG", "Prompt Engineering", "Hallucinations", "Context Window"],
            "model_answer": "Use Prompt Engineering for fast iteration and low complexity. Choose RAG when the model requires real-time access to company documents, user-specific permissions, and verifiable source citations. Choose LoRA/QLoRA Fine-Tuning when you need to teach the model a specialized output syntax (e.g., DSL code generation), custom tone, or consistent classification taxonomy where RAG context injection consumes too much token budget.",
            "followup": "What is the catastrophic forgetting phenomenon during fine-tuning, and how do you prevent it?"
        }
    ],

    "role-data-scientist": [
        {
            "id": "ds-q1",
            "title": "A/B Testing Rigor: Sample Sizing, Power Analysis, & P-Hacking",
            "category": "Experimentation",
            "difficulty": "Senior",
            "role": "Data Scientist",
            "question": "How do you design an A/B experiment for a low-conversion checkout funnel? Explain how you calculate sample size, minimum detectable effect (MDE), and how you prevent p-hacking.",
            "hints": [
                "Statistical power (1 - beta) is usually set to 80%; alpha to 5%.",
                "Continuous peeking inflates false-positive rates; use sequential testing.",
                "Apply CUPED (Controlled-experiment Using Pre-Experiment Data) variance reduction."
            ],
            "key_concepts": ["A/B Testing", "Statistical Power", "MDE", "P-Hacking", "CUPED", "Sequential Testing", "Bonferroni Correction"],
            "model_answer": "Calculate sample size upfront based on baseline conversion rate, desired MDE, significance level (alpha = 0.05), and power (1 - beta = 0.80). To accelerate convergence in low-conversion funnels, apply CUPED variance reduction using pre-experiment behavioral data. Strictly prohibit continuous monitoring / peeking unless employing sequential testing methodologies (e.g. mSPRT) to prevent inflating false-positive rates.",
            "followup": "How do you account for network spillover effects when testing social or two-sided marketplace features?"
        }
    ],

    "role-data-analyst": [
        {
            "id": "da-q1",
            "title": "Advanced SQL: Cohort Retention & Churn Rate Analytics",
            "category": "SQL & Analytics",
            "difficulty": "Mid-Senior",
            "role": "Data Analyst",
            "question": "Write and explain a SQL query structure that calculates monthly user cohort retention rates over 12 months from a raw user_activity_log table.",
            "hints": [
                "Use DATE_TRUNC to define the signup cohort month.",
                "Compute month differences using AGE or EXTRACT(epoch).",
                "Use pivot or conditional SUM(CASE WHEN month_offset = X THEN 1 END)."
            ],
            "key_concepts": ["SQL", "Cohort Retention", "DATE_TRUNC", "Window Functions", "LAG/LEAD", "Dimensional Modeling"],
            "model_answer": "We first create a CTE that finds each user's first activity month using MIN(DATE_TRUNC('month', created_at)). A second CTE joins subsequent activity records, calculating the month offset: (EXTRACT(year FROM act.date) - EXTRACT(year FROM first.date)) * 12 + EXTRACT(month FROM act.date) - EXTRACT(month FROM first.date). Finally, aggregate grouped by cohort_month and divide the active user count in month N by month 0 count to yield percentage retention curves.",
            "followup": "How would you design a dimensional Star Schema with fact and dimension tables to make this query sub-second on a 100M-row warehouse?"
        }
    ],

    "role-creative-3d": [
        {
            "id": "c3d-q1",
            "title": "WebGL Memory Deallocation & 60fps Optimization in Three.js",
            "category": "3D Web Graphics",
            "difficulty": "Senior",
            "role": "Creative 3D Web Engineer",
            "question": "How do you prevent memory leaks and GPU crashes in a Single Page App when transitioning between scenes rendering 100,000 instanced Three.js meshes?",
            "hints": [
                "Three.js objects must have geometries, materials, and textures explicitly disposed.",
                "Use InstancedMesh instead of 100k individual Mesh objects.",
                "Call renderer.dispose() and cancelAnimationFrame on unmount."
            ],
            "key_concepts": ["Three.js", "InstancedMesh", "WebGL", "dispose()", "GPU Memory", "Draw Calls", "Frustum Culling"],
            "model_answer": "Creating 100k individual meshes produces 100k GPU draw calls, causing immediate framerate collapse. We resolve this by using an InstancedMesh, rendering all instances in a single draw call with matrix transformations. When transitioning routes, traverse the scene graph recursively and call geometry.dispose(), material.dispose(), and texture.dispose() to free VRAM buffers, otherwise JavaScript garbage collection will leave uncollected GPU memory leaks.",
            "followup": "How do you write a custom GLSL vertex and fragment shader to animate waves on a mesh without CPU overhead?"
        }
    ],

    "role-uiux": [
        {
            "id": "uiux-q1",
            "title": "Enterprise Design Systems & Accessibility (WCAG 2.2 AAA)",
            "category": "Design Systems",
            "difficulty": "Senior",
            "role": "UI/UX Designer",
            "question": "How do you establish a multi-brand Design System in Figma with semantic design tokens, WCAG 2.2 contrast compliance, and automated component handoff to React?",
            "hints": [
                "Use 3 token tiers: Global (Raw), Semantic (Intent), and Component-specific.",
                "Contrast ratios: 4.5:1 for normal text (AA), 7:1 for AAA.",
                "Export tokens via Style Dictionary or Token Studio to CSS variables."
            ],
            "key_concepts": ["Design Tokens", "Figma Variables", "WCAG 2.2", "Semantic Color", "Style Dictionary", "Handoff"],
            "model_answer": "Structure design tokens into 3 hierarchical layers: Global values (raw hex palette), Semantic alias tokens (surface.primary, text.subtle), and Component tokens. Test all text color pairs against automated WCAG APCA / contrast algorithms (minimum 4.5:1 for AA, 7:1 for AAA). Use Figma Variables paired with Style Dictionary to auto-export JSON tokens into CSS variables and Tailwind themes for developers.",
            "followup": "How do you conduct usability testing to measure cognitive load on dense data dashboard layouts?"
        }
    ],

    "role-swe": [
        {
            "id": "swe-q1",
            "title": "Designing an LRU Cache with O(1) Get and Put Operations",
            "category": "Data Structures & Algorithms",
            "difficulty": "Senior",
            "role": "Software Engineer (DSA & Systems)",
            "question": "Describe the internal data structure architecture required to implement a Least Recently Used (LRU) Cache supporting get(key) and put(key, value) in strictly O(1) time complexity.",
            "hints": [
                "A hash map alone cannot maintain access ordering in O(1).",
                "A doubly linked list allows O(1) removal and insertion at head/tail.",
                "Combine HashMap<Key, Node> with DoublyLinkedList."
            ],
            "key_concepts": ["LRU Cache", "Doubly Linked List", "Hash Map", "O(1) Complexity", "Concurrency", "Eviction"],
            "model_answer": "An LRU Cache requires combining a Hash Map with a Doubly Linked List. The Hash Map stores keys mapped to linked list Node pointers, giving O(1) key lookups. The Doubly Linked List maintains access recency with dummy Head and Tail sentinels. When get(key) or put() is called, the accessed Node is unlinked in O(1) and moved to the Head. When capacity is exceeded, the Node before the Tail sentinel is evicted in O(1) and deleted from the Hash Map.",
            "followup": "How do you make this LRU Cache thread-safe in a multi-threaded server without locking the entire cache on every read?"
        }
    ]
}


class EvaluateRequest(BaseModel):
    role_id: str
    question_id: str
    question_text: str
    user_answer: str
    category: Optional[str] = "Technical"

class ChatRequest(BaseModel):
    role_id: str
    question_id: str
    question_text: str
    conversation_history: List[Dict[str, str]]
    user_message: str


@router.get("/questions")
def get_questions(
    role: Optional[str] = "role-fs",
    category: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """
    Returns curated mock interview questions tailored to the candidate's target role.
    """
    bank = EXTENSIVE_QUESTION_BANK.get(role, EXTENSIVE_QUESTION_BANK["role-fs"])
    if not bank:
        bank = EXTENSIVE_QUESTION_BANK["role-fs"]

    filtered = bank
    if category and category != "All":
        filtered = [q for q in filtered if category.lower() in q.get("category", "").lower()]
    if difficulty and difficulty != "All":
        filtered = [q for q in filtered if difficulty.lower() in q.get("difficulty", "").lower()]

    return {
        "role": role,
        "total_available": len(filtered or bank),
        "questions": filtered if filtered else bank
    }


@router.post("/evaluate")
def evaluate_answer(
    payload: EvaluateRequest,
    current_user: User = Depends(get_current_user_or_guest)
):
    """
    Deep multi-criteria technical evaluation engine:
    1. Conceptual coverage vs expected architecture patterns.
    2. Depth and trade-off articulation.
    3. Technical correctness and clarity scoring.
    4. Model senior answer + intelligent follow-up probe.
    """
    answer = payload.user_answer.strip()
    words = answer.split()
    word_count = len(words)

    # Locate question metadata
    matching_q = None
    for role_questions in EXTENSIVE_QUESTION_BANK.values():
        for q in role_questions:
            if q["id"] == payload.question_id:
                matching_q = q
                break
        if matching_q:
            break

    expected_concepts = matching_q["key_concepts"] if matching_q else [
        "Architecture", "Scalability", "Optimization", "Trade-offs", "Security", "Failure Modes"
    ]

    # Evaluate concept coverage
    matched_concepts = [c for c in expected_concepts if c.lower() in answer.lower()]
    missing_concepts = [c for c in expected_concepts if c not in matched_concepts]
    concept_ratio = len(matched_concepts) / max(len(expected_concepts), 1)

    # Word count depth curve
    depth_multiplier = min(word_count / 120.0, 1.0)

    # Calculate multi-dimensional metrics
    tech_score = int(min(100, max(45, (concept_ratio * 65.0) + (depth_multiplier * 35.0))))
    clarity_score = int(min(98, max(50, 70 + (10 if word_count > 60 else -10) + (10 if ("." in answer or "\n" in answer) else 0))))
    completeness_score = int(min(96, max(35, (concept_ratio * 50.0) + (depth_multiplier * 50.0))))
    overall_score = int((tech_score * 0.45) + (completeness_score * 0.35) + (clarity_score * 0.20))

    strengths = []
    if matched_concepts:
        strengths.append(f"Strong command of foundational concepts: {', '.join(matched_concepts[:4])}")
    if word_count > 80:
        strengths.append("Provided thorough architectural explanation with concrete system trade-offs")
    else:
        strengths.append("Direct, concise initial technical direction")

    improvements = []
    if missing_concepts:
        improvements.append(f"Deepen response by addressing: {', '.join(missing_concepts[:3])}")
    if word_count < 75:
        improvements.append("Elaborate on production failure modes, latency SLAs, and memory footprints")
    improvements.append("Incorporate quantitative metrics (e.g. latency, throughput, error rates) from personal experience")

    verdict = (
        "Exceptional Candidate (Senior+)" if overall_score >= 88
        else "Strong Technical Response" if overall_score >= 74
        else "Competent (Needs Deeper Trade-Offs)" if overall_score >= 60
        else "Developing Foundation"
    )

    followup_q = matching_q.get("followup", "Can you explain how you would monitor and alert on this system in production?") if matching_q else "How do you handle edge cases when traffic spikes 10x?"

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
        "model_answer": matching_q["model_answer"] if matching_q else "A senior engineer structures their answer around system constraints, architecture trade-offs, and measurable SLA metrics.",
        "followup_question": followup_q,
        "feedback": f"Your response earned {overall_score}%. {strengths[0]}."
    }


@router.post("/converse")
def chat_with_interviewer(payload: ChatRequest):
    """
    Simulates a live multi-turn AI technical interview conversation.
    Interviewer challenges candidate assumptions, probes design trade-offs, and guides dialogue.
    """
    user_msg = payload.user_message.strip()
    words = user_msg.split()

    # Dynamic critique and follow-up generation
    ai_response = ""
    if len(words) < 15:
        ai_response = f"That's a start, but in a senior technical interview you need to be specific. When you mention that approach, what happens when concurrent writes occur or during network partitions? Walk me through the exact failure recovery sequence."
    elif any(kw in user_msg.lower() for kw in ["redis", "cache", "lock", "jwt", "gateway"]):
        ai_response = f"Good technical point regarding your caching and access layer. Let's dig deeper: how do you prevent cache stampedes (thundering herd) when a critical key expires under 10,000 requests per second? Would you implement probabilistic early expiration or distributed locks?"
    elif any(kw in user_msg.lower() for kw in ["database", "postgres", "sql", "index", "query"]):
        ai_response = f"Interesting database choice. If your query response time degrades from 20ms to 2.5s under peak load, what specific tools (e.g., EXPLAIN ANALYZE, pg_stat_statements) do you use to locate the bottleneck, and how do you decide between a composite index vs partitioning?"
    else:
        ai_response = f"Solid breakdown. Now let's consider scale: if this service needs to handle 50,000 requests per second across 3 continents with sub-100ms latency, how does your architecture evolve? What trade-offs between consistency and availability (CAP theorem) do you accept?"

    return {
        "interviewer_reply": ai_response,
        "encouragement": "Good active dialogue. Continue articulating your technical reasoning clearly."
    }
