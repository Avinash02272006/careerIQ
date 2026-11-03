import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";
import ExportReportModal from "../../components/modals/ExportReportModal";

// Authoritative In-Depth Learning Modules & Senior Interview Questions to Master
const COMPREHENSIVE_LEARNING_ROADMAPS = {
  "role-fs": [
    {
      week: 1,
      topic: "Docker Multi-Stage Builds & Container Networking",
      resource: "Docker Production Manual & Linux Namespaces",
      estimatedHours: "12 hours",
      conceptualDeepDive: "Understand union filesystems (Overlay2), layer caching, non-root user execution, and bridge networking between Node.js and PostgreSQL containers.",
      tasks: [
        "Write optimized multi-stage Dockerfile pruning devDependencies, cutting image size from 1.2GB to under 120MB",
        "Configure docker-compose.yml with healthchecks, internal network bridges, and named volumes for Postgres persistence",
        "Set up non-root security context and handle dumb-init / tini for PID 1 signal forwarding"
      ],
      interviewQuestions: [
        {
          q: "How does Docker's copy-on-write (CoW) union filesystem work, and why do multi-stage builds drastically reduce vulnerabilities?",
          answer: "Docker uses storage drivers like Overlay2 that stack read-only image layers under a writable container layer. Multi-stage builds compile artifacts in a heavy build stage (with build tools, SDKs, compilers) and copy only the final binary into a minimal scratch or alpine image, preventing secret leaks and eliminating 90% of CVE attack surface.",
          pitfall: "Failing to clean npm cache or leaving build-essential packages in the final runtime container."
        },
        {
          q: "Why is running a Node.js process as PID 1 in a Docker container dangerous, and how do you resolve it?",
          answer: "In Linux, PID 1 has special responsibilities: reaping zombie orphan processes and handling signals (SIGTERM, SIGINT). Node.js is not an init system, so it ignores SIGTERM by default, causing 10-second SIGKILL delays. Fix this by using 'tini' or 'dumb-init' as the container ENTRYPOINT.",
          pitfall: "Assuming 'node index.js' automatically responds to docker stop SIGTERM."
        }
      ]
    },
    {
      week: 2,
      topic: "High-Throughput Redis Caching & Cache Invalidation",
      resource: "Redis University & Distributed Systems Patterns",
      estimatedHours: "14 hours",
      conceptualDeepDive: "Master Cache-Aside vs Write-Through strategies, distributed locks with atomic SETNX, cache stampede mitigation, and Redis key eviction policies (volatile-lru vs allkeys-lru).",
      tasks: [
        "Implement resilient Cache-Aside middleware with generic TTL decay on high-throughput GET endpoints",
        "Protect against cache stampedes using Redis SETNX mutex locks or probabilistic early expiration (XFetch)",
        "Write automated integration tests proving cache invalidation triggers on database entity mutations"
      ],
      interviewQuestions: [
        {
          q: "What is the Thundering Herd (Cache Stampede) problem, and how do you prevent it in production?",
          answer: "When a high-traffic cache key expires, thousands of concurrent requests miss the cache simultaneously and slam the database. We prevent this using distributed mutex locking (Redis SET key val NX EX 10) so only one worker queries the DB, or using probabilistic early recomputation (XFetch algorithm) where requests nearing expiration trigger background refreshes.",
          pitfall: "Setting identical fixed TTLs on all keys rather than adding random jitter."
        },
        {
          q: "When updating a database record, should you update the cache or delete it? Walk through the race conditions.",
          answer: "Always delete the cache key after committing the database transaction. If you update the cache in place, concurrent writes can arrive in different orders at the DB and cache, resulting in stale data. Deleting the key guarantees the next read fetches authoritative database state.",
          pitfall: "Deleting the cache before the DB transaction commits, allowing a concurrent read to repopulate stale data."
        }
      ]
    },
    {
      week: 3,
      topic: "PostgreSQL Query Optimization & Connection Pooling",
      resource: "PostgreSQL Internals Guide & PgBouncer Documentation",
      estimatedHours: "15 hours",
      conceptualDeepDive: "Analyze query execution plans with EXPLAIN (ANALYZE, BUFFERS), design composite B-Tree and GIN trigram indexes, and deploy PgBouncer connection pooling.",
      tasks: [
        "Run EXPLAIN (ANALYZE, BUFFERS) on 4-table JOINs and eliminate sequential disk scans",
        "Implement pg_trgm GIN indexes for fast fuzzy text searching instead of slow leading wildcards",
        "Deploy PgBouncer in transaction pooling mode to scale Node.js clusters to 2,000 concurrent client connections"
      ],
      interviewQuestions: [
        {
          q: "Why do standard B-Tree indexes fail on queries with leading wildcards (LIKE '%term%'), and how do you solve it?",
          answer: "B-Tree indexes sort entries lexicographically from the left prefix. Leading wildcards prevent binary search traversal, causing full table sequential scans. We resolve this by enabling PostgreSQL's 'pg_trgm' extension and building a GIN (Generalized Inverted Index) trigram index over 3-character substrings.",
          pitfall: "Adding redundant single-column B-Trees that the query planner ignores."
        },
        {
          q: "What are the trade-offs between Session Pooling and Transaction Pooling in PgBouncer?",
          answer: "Session pooling keeps server connections tied to clients for their entire session (supports PREPARE statements and LISTEN/NOTIFY). Transaction pooling returns the server connection to the pool as soon as the transaction ends, allowing thousands of clients to share a few dozen Postgres connections. However, transaction pooling prohibits session-level features like named prepared statements.",
          pitfall: "Using transaction pooling with ORMs that rely on session-level temporary tables without proper configuration."
        }
      ]
    },
    {
      week: 4,
      topic: "System Design: Idempotent Payment & Event-Driven APIs",
      resource: "Designing Data-Intensive Applications (Martin Kleppmann)",
      estimatedHours: "16 hours",
      conceptualDeepDive: "Design distributed transactions, event-driven microservices with RabbitMQ/Kafka, Dead Letter Queues, and client idempotency keys.",
      tasks: [
        "Architect payment checkout API with Idempotency-Key validation in Redis",
        "Implement Dead Letter Queue with exponential backoff for failed webhook deliveries",
        "Diagram end-to-end event sourcing flow handling out-of-order asynchronous delivery"
      ],
      interviewQuestions: [
        {
          q: "How do you guarantee exactly-once processing semantics in an event-driven distributed system?",
          answer: "True exactly-once delivery over unreliable networks is theoretically impossible (Two Generals Problem). In practice, we achieve effectively exactly-once by pairing at-least-once delivery (message acknowledgments and retries) with idempotent consumers (using unique message IDs stored in a deduplication database table).",
          pitfall: "Assuming the message broker alone can guarantee end-to-end exactly-once without consumer deduplication."
        }
      ]
    }
  ],

  "role-fe": [
    {
      week: 1,
      topic: "Interaction to Next Paint (INP) & Core Web Vitals Mastery",
      resource: "web.dev Performance Engineering & Chrome DevTools Protocol",
      estimatedHours: "14 hours",
      conceptualDeepDive: "Diagnose long main-thread tasks (>50ms), profile render reflows, and optimize user responsiveness using modern scheduling primitives.",
      tasks: [
        "Audit production SPA using Chrome Performance Profiler and identify main thread blocking tasks",
        "Break up expensive client-side sorting loops using scheduler.yield() and requestIdleCallback",
        "Eliminate Cumulative Layout Shift (CLS) by enforcing explicit aspect ratios on dynamic media"
      ],
      interviewQuestions: [
        {
          q: "Explain what Interaction to Next Paint (INP) measures and how it differs from First Input Delay (FID).",
          answer: "FID only measured the delay of the very first user interaction. INP measures the 98th percentile latency of all clicks, taps, and keyboard inputs across the entire user session. Long JavaScript tasks block the browser from repainting the feedback frame, driving up INP.",
          pitfall: "Only optimizing page load speed while ignoring ongoing runtime interaction freezes."
        }
      ]
    },
    {
      week: 2,
      topic: "React 19 Concurrent Primitives & State Architecture",
      resource: "React 19 Official Documentation & RFCs",
      estimatedHours: "12 hours",
      conceptualDeepDive: "Leverage useTransition, useDeferredValue, React Server Components, and persistent client state slices with Zustand.",
      tasks: [
        "Refactor high-frequency search filtering with useTransition to keep input typing at 60fps",
        "Implement persistent, type-safe global state with Zustand slices and localStorage sync",
        "Design Suspense streaming boundaries to progressively render asynchronous components"
      ],
      interviewQuestions: [
        {
          q: "What problem does useTransition solve in React, and how does it differ from debouncing?",
          answer: "Debouncing simply delays state updates until the user stops typing. useTransition immediately initiates the state transition concurrently without delay, but marks it as non-urgent. If urgent inputs (typing, clicking) occur during rendering, React interrupts the transition to handle user input immediately.",
          pitfall: "Using debounce when what is actually needed is non-blocking concurrent rendering."
        }
      ]
    }
  ],

  "role-be": [
    {
      week: 1,
      topic: "Distributed Concurrency, Locks, & Idempotency",
      resource: "Distributed Systems Architecture Guide",
      estimatedHours: "15 hours",
      conceptualDeepDive: "Implement distributed locking with Redis SETNX (Redlock algorithm), optimistic concurrency control via DB version columns, and idempotent API endpoints.",
      tasks: [
        "Build generic idempotency middleware in FastAPI/Express verifying Idempotency-Key headers",
        "Implement optimistic concurrency locking with version counters on database records",
        "Simulate network partitions and test race condition recovery under 1,000 concurrent threads"
      ],
      interviewQuestions: [
        {
          q: "How does Optimistic Concurrency Control (OCC) differ from Pessimistic Locking, and when would you use each?",
          answer: "Pessimistic locking (SELECT FOR UPDATE) acquires database row locks upfront, preventing other transactions from reading or writing (ideal for high-contention bank balances). OCC lets transactions read and compute without locks, then verifies a version column during update (WHERE id = ? AND version = ?). If version changed, it aborts and retries (ideal for read-heavy, low-contention scenarios).",
          pitfall: "Using pessimistic locks in distributed microservices, causing distributed deadlocks."
        }
      ]
    },
    {
      week: 2,
      topic: "Message Queues: Partitioning, Kafka Consumer Groups, & DLQ",
      resource: "Apache Kafka: The Definitive Guide",
      estimatedHours: "16 hours",
      conceptualDeepDive: "Understand log partitions, consumer group rebalancing, offset commits, Dead Letter Queues, and poison pill handling.",
      tasks: [
        "Configure Kafka/RabbitMQ consumer group with manual acknowledgment commits",
        "Build Dead Letter Queue with exponential retry backoff and admin alerting",
        "Profile consumer lag during traffic bursts and configure horizontal worker autoscaling"
      ],
      interviewQuestions: [
        {
          q: "How do consumer group rebalances happen in Kafka, and how do you prevent stop-the-world rebalance storms?",
          answer: "Rebalances occur when consumers join, leave, or fail heartbeat checks. Traditional eager rebalancing revoked all partitions from all consumers. Modern Kafka uses Cooperative Sticky Rebalancing, which only revokes and reassigns partitions that need to move, allowing unaffected consumers to continue processing without interruption.",
          pitfall: "Committing offsets before message processing completes, causing message loss if worker crashes."
        }
      ]
    }
  ],

  "role-devops": [
    {
      week: 1,
      topic: "Kubernetes Cluster Resiliency & Zero-Downtime Rollouts",
      resource: "Kubernetes Production Best Practices",
      estimatedHours: "14 hours",
      conceptualDeepDive: "Configure RollingUpdates, PodDisruptionBudgets, Liveness and Readiness probes, and preStop hooks for graceful connection draining.",
      tasks: [
        "Configure deployment manifests with maxSurge 25% and maxUnavailable 0",
        "Add preStop hook with connection draining sleep to prevent 502 errors during rollouts",
        "Deploy metrics-server and configure HorizontalPodAutoscaler based on CPU and custom HTTP request rates"
      ],
      interviewQuestions: [
        {
          q: "Why do Kubernetes pods generate 502 Bad Gateway errors during RollingUpdates, and how do you eliminate them?",
          answer: "When a pod terminates, Kubelet sends SIGTERM while asynchronously updating endpoint slices and iptables. If the app exits immediately, active requests still routed by iptables hit a dead socket, causing 502s. Fix this by adding a preStop hook with 'sleep 10' to allow the service endpoint removal to propagate before the app begins shutting down.",
          pitfall: "Confusing liveness probes with readiness probes, causing restart loops on healthy but booting containers."
        }
      ]
    }
  ],

  "role-ai": [
    {
      week: 1,
      topic: "Production RAG Architecture: Chunking, Vectors & Reranking",
      resource: "Hugging Face & Vector Database Architecture Papers",
      estimatedHours: "16 hours",
      conceptualDeepDive: "Implement recursive semantic chunking, dense embeddings via pgvector HNSW indexing, and cross-encoder reranking.",
      tasks: [
        "Implement hybrid search combining BM25 sparse keyword queries and dense vector cosine distance",
        "Integrate cross-encoder reranking to distill top-30 candidate chunks down to top-4 high-precision contexts",
        "Benchmark RAG accuracy against hallucinations using the Ragas evaluation framework (Faithfulness & Relevance)"
      ],
      interviewQuestions: [
        {
          q: "Why is semantic chunking superior to fixed-length character chunking in enterprise RAG pipelines?",
          answer: "Fixed-length chunking cuts sentences and code blocks in half, destroying syntactic and semantic context. Semantic chunking evaluates paragraph and heading boundaries, ensuring complete conceptual units are embedded into vector space, which drastically improves retrieval recall and eliminates hallucinated inferences.",
          pitfall: "Using huge chunk sizes (>1500 tokens) that dilute the embedding vector with irrelevant noise."
        }
      ]
    }
  ]
};

// Fallback generator for other roles
function getLearningRoadmap(roleId) {
  return COMPREHENSIVE_LEARNING_ROADMAPS[roleId] || COMPREHENSIVE_LEARNING_ROADMAPS["role-fs"];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "roadmap" | "graphs" | "rawtext" | "skills"
  const [newSkillInput, setNewSkillInput] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const {
    hasAnalyzedResume,
    candidateName,
    candidateEmail,
    skills,
    addSkill,
    removeSkill,
    loadSampleDemo,
    targetRoleId,
    completedTasks,
    toggleTask,
    getReadinessScore,
    getRoleCompatibility,
    getTargetRoleGaps,
    getDomainRadarMetrics,
    resumeQuality,
  } = useCareerStore();

  const readiness = getReadinessScore();
  const compatibility = getRoleCompatibility(targetRoleId);
  const gaps = getTargetRoleGaps(targetRoleId);
  const radarMetrics = getDomainRadarMetrics();

  const activeRole = BENCHMARK_ROLES.find((r) => r.id === targetRoleId) || BENCHMARK_ROLES[0];
  const roadmap = getLearningRoadmap(targetRoleId);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim()) {
      addSkill(newSkillInput.trim());
      setNewSkillInput("");
    }
  };

  const totalTasks = roadmap.reduce((acc, step) => acc + (step.tasks?.length || 0), 0);
  const completedCount = Object.keys(completedTasks).filter(
    (k) => k.startsWith(targetRoleId) && completedTasks[k]
  ).length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Empty state if no resume uploaded
  if (!hasAnalyzedResume) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 w-full flex flex-col items-center space-y-8 font-mono">
        <div className="text-center space-y-3">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#2DD4BF] block">
            Placement Readiness Console
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-[-0.03em] text-white">
            No Resume Analyzed Yet
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed font-sans">
            Upload your resume document (PDF, PNG, JPG, Word .docx, or plain text) to extract your actual skills, audit your ATS score, and generate your placement readiness graphs.
          </p>
        </div>

        <div className="w-full max-w-md p-8 rounded-2xl bg-[#0E1015] border border-white/[0.08] text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 flex items-center justify-center text-xs text-[#2DD4BF] font-bold">
            ATS
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white font-sans">Start Document Extraction</h3>
            <p className="text-xs text-neutral-400 font-sans">
              Extract exact text, competencies, and role gaps in under 2 seconds.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate("/resume-analyzer")}
              className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-md"
            >
              Upload Resume (ATS Scanner) →
            </button>
            <button
              onClick={loadSampleDemo}
              className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-400 hover:text-white text-xs transition-colors"
            >
              Or Load Sample Candidate Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 font-mono">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-wider uppercase text-[#2DD4BF]">
              Candidate: {candidateName || "Candidate"}
            </span>
            {candidateEmail && (
              <span className="text-[10px] text-neutral-500">• {candidateEmail}</span>
            )}
          </div>
          <h1 className="font-display font-light text-2xl text-white tracking-tight">
            Placement Diagnostics & Skill Intelligence
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => navigate("/interview")}
            className="px-3 py-1.5 rounded-lg bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 text-[#2DD4BF] text-[11px] transition-colors"
          >
            AI Mock Interview →
          </button>
          <button
            onClick={() => navigate("/job-matching")}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white text-[11px] transition-colors"
          >
            Match Tech Jobs →
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 text-[11px] transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => navigate("/resume-analyzer")}
            className="px-3.5 py-1.5 rounded-lg font-medium bg-white text-black hover:bg-neutral-200 text-[11px] transition-colors shadow-sm"
          >
            Re-Scan Resume
          </button>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex border-b border-white/[0.06] text-xs gap-6">
        {[
          { id: "overview", label: "Overview & Diagnostics" },
          { id: "roadmap", label: `Deep Learning Roadmap (${roadmap.length} Weeks)` },
          { id: "graphs", label: "Industry Role Benchmarks" },
          { id: "skills", label: `Verified Skills (${skills.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[11px] tracking-wider uppercase transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-white text-white font-bold"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & DIAGNOSTICS */}
      {/* ============================================================ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* TOP METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Card */}
            <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 block">
                Placement Readiness Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-light text-4xl text-white">{readiness}</span>
                <span className="text-xs text-neutral-500">/ 100</span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2DD4BF] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(readiness || 0, 100)}%` }}
                />
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between text-[10px] text-neutral-400">
                <span>ATS Quality: {resumeQuality}%</span>
                <span>Verified Skills: {skills.length}</span>
              </div>
            </div>

            {/* Target Compatibility Card */}
            <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 block">
                Target Role Match ({activeRole.title})
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-light text-4xl text-white">{compatibility}%</span>
                <span className="text-xs text-neutral-500">Fit</span>
              </div>
              <p className="text-xs text-neutral-300 truncate font-medium font-sans">
                {activeRole.demand}% Market Hiring Demand
              </p>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between text-[10px]">
                <span className={gaps.length > 0 ? "text-amber-400" : "text-emerald-400"}>
                  {gaps.length > 0 ? `Skill Gaps: ${gaps.length} needed` : "All skills verified!"}
                </span>
                <button onClick={() => navigate("/roles")} className="text-[#2DD4BF] hover:underline">
                  Change Track →
                </button>
              </div>
            </div>

            {/* Roadmap Progress Card */}
            <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 block">
                Technical Roadmap Progress
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-light text-4xl text-white">{progressPct}%</span>
                <span className="text-xs text-neutral-500">
                  ({completedCount}/{totalTasks} tasks completed)
                </span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2DD4BF] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="pt-2 border-t border-white/[0.06] text-[10px] text-neutral-400 flex justify-between">
                <span>{roadmap.length} In-Depth Phases</span>
                <span className="text-[#2DD4BF]">Auto-saved</span>
              </div>
            </div>
          </div>

          {/* QUICK INTEGRATED ACTIONS STRIP */}
          <div className="p-4 rounded-2xl bg-[#0B0D13] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-sm">
                🎯
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Recommended Next Steps</p>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Practice AI mock interview questions for {activeRole.title} or review high-compatibility job openings.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate("/interview")}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
              >
                AI Mock Interview →
              </button>
              <button
                onClick={() => navigate("/job-matching")}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] text-xs transition-colors"
              >
                Match Tech Jobs →
              </button>
            </div>
          </div>

          {/* VISUAL GRAPHS ROW: RADAR & NEED TO UPGRADE */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* SPIDER / RADAR GRAPH */}
            <div className="md:col-span-6 p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-[10px] tracking-widest uppercase text-neutral-400">
                    6-Domain Competency Radar
                  </h3>
                  <p className="text-xs text-white">Candidate vs Industry Benchmark</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.08] text-[#2DD4BF]">
                  Live Radar
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarMetrics}>
                    <PolarGrid stroke="#1A1D26" />
                    <PolarAngleAxis
                      dataKey="domain"
                      tick={{ fill: "#8A91A5", fontSize: 10, fontFamily: "monospace" }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "#525866", fontSize: 9 }}
                      stroke="#1A1D26"
                    />
                    <Radar
                      name="Your Score"
                      dataKey="candidateScore"
                      stroke="#2DD4BF"
                      fill="#2DD4BF"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="benchmarkScore"
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.15}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0A0C13",
                        borderColor: "#333",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NEED TO UPGRADE SKILLS GAPS */}
            <div className="md:col-span-6 p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <h3 className="text-[10px] tracking-widest uppercase text-neutral-400">
                  Target Skill Gaps ({gaps.length})
                </h3>
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className="text-[11px] text-[#2DD4BF] hover:underline"
                >
                  View Learning Plan →
                </button>
              </div>

              {gaps.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {gaps.map((gap) => (
                    <div
                      key={gap.skill_name}
                      className="p-3 rounded-xl bg-[#0A0C10] border border-white/[0.06] flex items-center justify-between text-xs hover:border-white/[0.15] transition-colors"
                    >
                      <div>
                        <span className="text-white font-medium block">{gap.skill_name}</span>
                        <span className="text-[10px] text-[#2DD4BF]">
                          +{gap.estimated_gain} pts readiness lift
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addSkill(gap.skill_name)}
                          className="text-[10px] px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white"
                        >
                          + Mark Learned
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-mono py-8 text-center">
                  ✓ All core skills for {activeRole.title} are verified!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: DEEP LEARNING ROADMAP & INTERVIEW QUESTIONS TO MASTER */}
      {/* ============================================================ */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] uppercase text-[#2DD4BF] font-semibold block">
                  Curated Technical Curriculum
                </span>
                <h2 className="text-lg font-medium text-white font-sans">
                  Deep Technical Mastery & Interview Questions: {activeRole.title}
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Architectural deep-dives, hands-on production engineering tasks, and exact senior-level interview questions to master.
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#2DD4BF]">{progressPct}% Completed</span>
                <span className="text-[10px] text-neutral-500 block">
                  {completedCount} of {totalTasks} tasks verified
                </span>
              </div>
            </div>

            {/* WEEKLY MODULES ACCORDION */}
            <div className="space-y-6">
              {roadmap.map((module, mIdx) => (
                <div
                  key={mIdx}
                  className="p-5 rounded-xl bg-[#08090C] border border-white/[0.08] space-y-4 shadow-lg"
                >
                  {/* Module Header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 font-bold">
                          Phase 0{module.week}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Est. Time: {module.estimatedHours || "14 hours"}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white font-sans mt-1">
                        {module.topic}
                      </h3>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">
                      📚 {module.resource}
                    </span>
                  </div>

                  {/* Conceptual Deep Dive */}
                  {module.conceptualDeepDive && (
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-sans text-neutral-300 leading-relaxed">
                      <span className="text-[10px] font-mono uppercase text-[#2DD4BF] block font-semibold mb-1">
                        Architectural Concept:
                      </span>
                      {module.conceptualDeepDive}
                    </div>
                  )}

                  {/* Production Tasks Checklist */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-neutral-400 block font-semibold">
                      Production Engineering Challenges:
                    </span>
                    <div className="space-y-1.5 pl-1">
                      {(module.tasks || []).map((task, tIdx) => {
                        const taskId = `${targetRoleId}-${mIdx}-${tIdx}`;
                        const isDone = !!completedTasks[taskId];
                        return (
                          <label
                            key={tIdx}
                            className="flex items-start gap-2.5 text-xs text-neutral-300 hover:text-white cursor-pointer select-none font-sans"
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleTask(taskId)}
                              className="mt-0.5 rounded border-white/[0.2] bg-black text-[#2DD4BF] focus:ring-0"
                            />
                            <span className={isDone ? "line-through text-neutral-500" : ""}>
                              {task}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* HIGH-STAKES INTERVIEW QUESTIONS TO MASTER */}
                  {module.interviewQuestions && module.interviewQuestions.length > 0 && (
                    <div className="pt-3 border-t border-white/[0.06] space-y-3">
                      <span className="text-[10px] uppercase text-amber-400 block font-semibold flex items-center gap-1.5">
                        <span>★</span> High-Stakes Interview Questions to Master:
                      </span>

                      <div className="space-y-2.5">
                        {module.interviewQuestions.map((iq, qIdx) => {
                          const qKey = `q-${mIdx}-${qIdx}`;
                          const isExpanded = expandedQuestionId === qKey;

                          return (
                            <div
                              key={qIdx}
                              className="p-3.5 rounded-xl bg-[#0D0F16] border border-white/[0.06] space-y-2"
                            >
                              <div
                                onClick={() =>
                                  setExpandedQuestionId(isExpanded ? null : qKey)
                                }
                                className="flex justify-between items-start gap-2 cursor-pointer group"
                              >
                                <p className="text-xs font-semibold text-neutral-200 group-hover:text-[#2DD4BF] font-sans">
                                  {iq.q}
                                </p>
                                <span className="text-xs text-neutral-500 font-mono">
                                  {isExpanded ? "▲ Hide" : "▼ Model Answer"}
                                </span>
                              </div>

                              {isExpanded && (
                                <div className="pt-2.5 border-t border-white/[0.06] space-y-2 text-xs font-sans">
                                  <div className="text-neutral-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/[0.04]">
                                    <span className="text-[10px] font-mono uppercase text-[#2DD4BF] block font-semibold mb-1">
                                      Exemplary Answer Structure:
                                    </span>
                                    {iq.answer}
                                  </div>

                                  {iq.pitfall && (
                                    <div className="text-rose-300 text-[11px] bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                      <strong>⚠️ Critical Interview Pitfall:</strong> {iq.pitfall}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: INDUSTRY ROLE BENCHMARKS */}
      {/* ============================================================ */}
      {activeTab === "graphs" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-medium text-white">10 Benchmark Hiring Tracks</h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Compatibility score calculated against verified skills extracted from your resume.
                </p>
              </div>
              <span className="text-[11px] text-[#2DD4BF]">Real-time Compatibility</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BENCHMARK_ROLES.map((r) => {
                const fitScore = getRoleCompatibility(r.id);
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-semibold text-white">{r.title}</h3>
                      <span className="text-xs font-bold text-[#2DD4BF]">{fitScore}% Fit</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2DD4BF] transition-all duration-500"
                        style={{ width: `${fitScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 font-sans">{r.description}</p>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-neutral-500">{r.required_skills.length} Required Skills</span>
                      <button
                        onClick={() => {
                          useCareerStore.getState().setTargetRole(r.id);
                          setActiveTab("overview");
                        }}
                        className="text-[#2DD4BF] hover:underline"
                      >
                        Set as Target Track →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: VERIFIED SKILLS */}
      {/* ============================================================ */}
      {activeTab === "skills" && (
        <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-medium text-white">
                Verified Technical Competencies ({skills.length})
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Extracted via multi-engine parser or added manually. Used in real-time job matching.
              </p>
            </div>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Redis, PyTorch)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="bg-[#08090C] border border-white/[0.08] focus:border-[#2DD4BF] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 outline-none w-52 font-sans"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200"
              >
                + Add
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-200 text-xs flex items-center gap-2 group hover:border-white/[0.2]"
              >
                <span>✓ {s}</span>
                <button
                  onClick={() => removeSkill(s)}
                  className="text-neutral-500 hover:text-rose-400 text-sm leading-none ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
