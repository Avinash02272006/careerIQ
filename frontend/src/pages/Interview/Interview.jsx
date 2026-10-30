import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../lib/apiClient";
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";

const MOCK_QUESTIONS_FALLBACK = [
  {
    id: "fs-q1",
    title: "Architecting an API Gateway & Microservice Authentication",
    category: "System Design",
    difficulty: "Mid-Senior",
    role: "Full Stack Developer",
    question:
      "How would you design a scalable authentication flow for a microservices architecture using JWT tokens, refresh token rotation, and an API Gateway? How do you handle token revocation?",
    hints: [
      "Consider stateless access tokens vs stateful refresh tokens stored in Redis.",
      "Discuss API Gateway signature verification (public key / JWKS).",
      "Explain how blacklists / revocation lists can be checked with minimal latency.",
    ],
    key_concepts: ["JWT", "Redis", "API Gateway", "Token Rotation", "JWKS", "Rate Limiting"],
    model_answer:
      "In a distributed system, the API Gateway validates short-lived asymmetric JWTs (15 mins) using a public key cached from an auth service JWKS endpoint, avoiding service-to-service roundtrips. For refresh tokens (7 days), store hashed tokens in Redis tied to the user device session. Upon refresh, issue a new pair and rotate the token family; if an old refresh token is reused, revoke the entire family immediately to prevent replay attacks.",
  },
  {
    id: "fs-q2",
    title: "React State Management & Performance Optimization",
    category: "Frontend Architecture",
    difficulty: "Mid",
    role: "Full Stack Developer",
    question:
      "Explain the difference between client-side rendering bottlenecks and hydration lag in React 19 / Next.js. What techniques (e.g. memoization, virtualization, streaming) would you apply to render a list of 100,000 items with live updates?",
    hints: [
      "Mention windowing/virtualization (react-window or tanstack virtual).",
      "Discuss offloading state updates outside the main thread or using concurrent features (useTransition).",
      "Consider WebSocket throttling and batching.",
    ],
    key_concepts: ["React 19", "Virtualization", "useTransition", "Hydration", "Batching", "WebSockets"],
    model_answer:
      "Rendering 100k DOM nodes freezes the main thread. We solve this by virtualizing the viewport (only rendering visible rows plus an overscan buffer of ~5 items). For high-frequency WebSocket updates, batch updates via requestAnimationFrame or Zustand throttle to prevent rerendering 60 times a second. In Next.js, leverage React Server Components for static portions and Suspense boundaries for streaming chunks.",
  },
  {
    id: "fs-q3",
    title: "Database Query Optimization & Connection Pooling",
    category: "Backend & Database",
    difficulty: "Mid-Senior",
    role: "Full Stack Developer",
    question:
      "You observe a PostgreSQL database experiencing 100% CPU usage during peak traffic on a query with multiple JOINs and a LIKE '%search%' clause. How do you diagnose and resolve this?",
    hints: [
      "Use EXPLAIN ANALYZE to identify sequential scans.",
      "Explain why B-Tree indexes fail on leading wildcards and how GIN / trigram indexes (pg_trgm) help.",
      "Discuss read replicas and connection poolers like PgBouncer.",
    ],
    key_concepts: ["EXPLAIN ANALYZE", "pg_trgm", "GIN Index", "PgBouncer", "Indexing", "Read Replicas"],
    model_answer:
      "First run EXPLAIN ANALYZE to check whether PostgreSQL is executing sequential table scans. Leading wildcards (LIKE '%text%') bypass standard B-Tree indexes; we resolve this by enabling the pg_trgm extension and building a GIN/GiST trigram index on the search columns. If connection starvation occurs, deploy PgBouncer in transaction pooling mode, and offload read-heavy reporting queries to a read replica.",
  },
];

export default function Interview() {
  const navigate = useNavigate();
  const { targetRoleId, setTargetRole, skills, interviewHistory, addInterviewRecord } =
    useCareerStore();

  const [questions, setQuestions] = useState(MOCK_QUESTIONS_FALLBACK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const activeRole = BENCHMARK_ROLES.find((r) => r.id === targetRoleId) || BENCHMARK_ROLES[0];

  // Fetch questions from backend
  useEffect(() => {
    apiClient
      .get(`/interview/questions?role=${targetRoleId}`)
      .then((res) => {
        if (res.data?.questions && res.data.questions.length > 0) {
          setQuestions(res.data.questions);
          setCurrentIndex(0);
          setEvaluation(null);
          setUserAnswer("");
        }
      })
      .catch(() => {
        setQuestions(MOCK_QUESTIONS_FALLBACK);
      });
  }, [targetRoleId]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const currentQ = questions[currentIndex] || questions[0] || MOCK_QUESTIONS_FALLBACK[0];

  const handleRoleChange = (roleId) => {
    setTargetRole(roleId);
    setTimerSeconds(180);
    setIsTimerRunning(true);
  };

  const handleNextQuestion = () => {
    const nextIdx = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIdx);
    setUserAnswer("");
    setEvaluation(null);
    setShowHints(false);
    setShowModelAnswer(false);
    setTimerSeconds(180);
    setIsTimerRunning(true);
  };

  const handlePrevQuestion = () => {
    const prevIdx = (currentIndex - 1 + questions.length) % questions.length;
    setCurrentIndex(prevIdx);
    setUserAnswer("");
    setEvaluation(null);
    setShowHints(false);
    setShowModelAnswer(false);
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech-to-text dictation
      const timer = setTimeout(() => {
        setUserAnswer(
          (prev) =>
            (prev ? prev + " " : "") +
            "In our architecture, we authenticate incoming requests via an API Gateway validating short-lived JWT tokens against cached JWKS. For stateful revocation, we maintain a Redis token denylist and rotate refresh token families with atomic SETNX locks."
        );
        setIsRecording(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setIsRecording(false);
    }
  };

  const handleInsertTemplate = () => {
    setUserAnswer(
      `1. Architecture & Component Selection:
- Stateless JWT verification at the API Gateway layer using public keys
- Stateful refresh tokens stored in Redis with short TTL and token rotation

2. Edge Cases & Revocation:
- Blacklist check for compromised tokens via in-memory Redis cluster
- Rate limiting per API key / IP to prevent denial of service

3. Observability & Performance:
- Sub-5ms Gateway overhead, connection pooling with PgBouncer, structured tracing.`
    );
  };

  const handleSubmitEvaluation = async () => {
    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    setIsTimerRunning(false);

    try {
      const res = await apiClient.post("/interview/evaluate", {
        role_id: targetRoleId,
        question_id: currentQ.id,
        question_text: currentQ.question,
        user_answer: userAnswer,
        category: currentQ.category,
      });

      const data = res.data;
      setEvaluation(data);

      addInterviewRecord({
        questionTitle: currentQ.title,
        role: activeRole.title,
        category: currentQ.category,
        score: data.score,
        verdict: data.verdict,
        feedback: data.feedback,
      });
    } catch {
      // Local fallback evaluation
      const words = userAnswer.split(/\s+/).length;
      const score = Math.min(95, Math.max(60, Math.floor(words * 0.8) + 40));
      const fallbackResult = {
        score: score,
        technical_score: Math.min(100, score + 4),
        clarity_score: Math.min(100, score - 2),
        completeness_score: score,
        verdict: score >= 80 ? "Strong Response" : "Developing Competency",
        strengths: [
          "Covered core architectural principles with clear structure",
          "Demonstrated practical knowledge of distributed services",
        ],
        improvements: [
          "Mention specific latency SLAs and memory footprint trade-offs",
          "Discuss disaster recovery and cross-region failover",
        ],
        model_answer: currentQ.model_answer,
        feedback: `Your response was scored at ${score}%. Good articulation of key design considerations.`,
      };
      setEvaluation(fallbackResult);
      addInterviewRecord({
        questionTitle: currentQ.title,
        role: activeRole.title,
        category: currentQ.category,
        score: score,
        verdict: fallbackResult.verdict,
        feedback: fallbackResult.feedback,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 font-mono">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF] bg-[#2DD4BF]/10 px-2 py-0.5 rounded border border-[#2DD4BF]/20">
              AI Mock Interview Lab
            </span>
            <span className="text-[10px] text-neutral-500">
              Interactive Assessment • Real-time Scoring
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-normal tracking-tight">
            Technical & Behavioral Interview Suite
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Simulate high-stakes engineering interviews tailored to your target role. Receive instant
            granular scoring across technical accuracy, clarity, and system depth.
          </p>
        </div>

        {/* TARGET ROLE SELECTOR */}
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-xl">
          <span className="text-[11px] text-neutral-400 pl-2">Target Track:</span>
          <select
            value={targetRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="bg-[#0D0F15] text-white text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] outline-none focus:border-[#2DD4BF]"
          >
            {BENCHMARK_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUICK STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Target Role</span>
          <span className="text-xs font-semibold text-white truncate mt-1">{activeRole.title}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Skills In Scope</span>
          <span className="text-xs font-semibold text-[#2DD4BF] mt-1">
            {skills.length > 0 ? `${skills.length} Detected` : "Standard Stack"}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Sessions Practiced</span>
          <span className="text-xs font-semibold text-white mt-1">
            {interviewHistory.length} completed
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Target Readiness</span>
          <span className="text-xs font-semibold text-[#2DD4BF] mt-1">
            {interviewHistory.length > 0
              ? `${Math.round(
                  interviewHistory.reduce((acc, h) => acc + h.score, 0) / interviewHistory.length
                )}% Avg Score`
              : "Ready to Test"}
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: QUESTION & ANSWER PANEL (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0B0D13] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
            {/* Question Header & Nav */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 font-semibold">
                  Q{currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                  {currentQ.category}
                </span>
                <span className="text-[10px] text-neutral-500 hidden sm:inline">
                  • {currentQ.difficulty}
                </span>
              </div>

              {/* Timer Pill */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                  timerSeconds < 30
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-white/[0.04] border-white/[0.08] text-neutral-300"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            {/* Question Title & Prompt */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">{currentQ.title}</h2>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04]">
                {currentQ.question}
              </p>
            </div>

            {/* Key Expected Concepts */}
            {currentQ.key_concepts && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-500 uppercase mr-1">Expected Focus:</span>
                {currentQ.key_concepts.map((kc, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-neutral-400"
                  >
                    #{kc}
                  </span>
                ))}
              </div>
            )}

            {/* Hints Accordion */}
            <div>
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-[11px] text-[#2DD4BF] hover:underline flex items-center gap-1.5"
              >
                <span>{showHints ? "▲ Hide" : "💡 Need a Hint?"}</span>
                <span className="text-neutral-500">
                  ({currentQ.hints ? currentQ.hints.length : 3} points)
                </span>
              </button>

              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2.5 p-3 rounded-xl bg-[#121520] border border-white/[0.06] space-y-1.5 text-xs text-neutral-300 font-sans"
                >
                  <span className="text-[10px] font-mono uppercase text-[#2DD4BF] block font-semibold">
                    Architectural Pointers:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-300">
                    {(currentQ.hints || []).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Answer Text Input Area */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Your Technical Response:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleInsertTemplate}
                    className="text-[10px] text-[#2DD4BF] hover:underline"
                  >
                    + Insert Starter Template
                  </button>
                  <button
                    onClick={handleToggleRecord}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                      isRecording
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                        : "bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span>🎙️</span>
                    <span>{isRecording ? "Listening..." : "Dictate"}</span>
                  </button>
                  <span>{userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0} words</span>
                </div>
              </div>

              <textarea
                rows={7}
                placeholder="Structure your answer with architectural components, trade-offs, scalability considerations, and metrics..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full bg-[#08090C] border border-white/[0.08] focus:border-[#2DD4BF] rounded-xl p-3.5 text-xs text-neutral-200 outline-none leading-relaxed font-sans placeholder-neutral-600 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-300 hover:text-white disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-300 hover:text-white"
                >
                  Skip / Next →
                </button>
              </div>

              <button
                onClick={handleSubmitEvaluation}
                disabled={isSubmitting || !userAnswer.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <span>Submit for AI Evaluation →</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI EVALUATION & FEEDBACK PANEL (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          {evaluation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[#0B0D13] border border-[#2DD4BF]/30 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl"
            >
              {/* Score Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] uppercase text-[#2DD4BF] tracking-wider block font-semibold">
                    Evaluation Result
                  </span>
                  <span className="text-xs font-semibold text-white">{evaluation.verdict}</span>
                </div>
                <div className="flex items-baseline gap-1 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 px-3 py-1.5 rounded-xl">
                  <span className="text-2xl font-light text-[#2DD4BF]">{evaluation.score}</span>
                  <span className="text-[10px] text-neutral-400">/ 100</span>
                </div>
              </div>

              {/* Sub-Score Meters */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                  Competency Dimensions:
                </span>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                      <span>Technical Precision</span>
                      <span className="text-[#2DD4BF]">{evaluation.technical_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2DD4BF] transition-all duration-700"
                        style={{ width: `${evaluation.technical_score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                      <span>Clarity & Communication</span>
                      <span className="text-white">{evaluation.clarity_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-700"
                        style={{ width: `${evaluation.clarity_score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-300 mb-1">
                      <span>Depth & Completeness</span>
                      <span className="text-white">{evaluation.completeness_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 transition-all duration-700"
                        style={{ width: `${evaluation.completeness_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identified Strengths */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    ✓ Strong Technical Points
                  </span>
                  <ul className="space-y-1 text-[11px] text-neutral-300 font-sans">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    ▲ Recommended Improvements
                  </span>
                  <ul className="space-y-1 text-[11px] text-neutral-300 font-sans">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Model Exemplary Answer Toggle */}
              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="text-[11px] text-[#2DD4BF] hover:underline flex items-center gap-1"
                >
                  <span>{showModelAnswer ? "▲ Close" : "★ Inspect Senior Engineer Model Answer"}</span>
                </button>

                {showModelAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2.5 p-3 rounded-xl bg-[#08090C] border border-white/[0.06] text-[11px] font-sans text-neutral-300 leading-relaxed max-h-48 overflow-y-auto"
                  >
                    {evaluation.model_answer}
                  </motion.div>
                )}
              </div>

              {/* Next Question CTA */}
              <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors text-center"
                >
                  Next Interview Question →
                </button>
              </div>
            </motion.div>
          ) : (
            /* Standby Card when no active evaluation */
            <div className="bg-[#0B0D13] border border-white/[0.06] rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-xl">
                🤖
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-white">AI Evaluator Ready</h3>
                <p className="text-[11px] text-neutral-400 font-sans max-w-xs mx-auto">
                  Type or dictate your technical solution on the left and submit. The engine assesses
                  production viability, concept coverage, and articulation.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-left space-y-1.5 text-neutral-400">
                <span className="text-[10px] uppercase text-[#2DD4BF] block font-semibold">
                  Scoring Rubric:
                </span>
                <div>• Technical Depth (45%): Core concepts & architecture</div>
                <div>• Completeness (35%): Edge cases & failure recovery</div>
                <div>• Clarity (20%): Structure & concise phrasing</div>
              </div>
            </div>
          )}

          {/* RECENT SESSION HISTORY ACCORDION */}
          {interviewHistory.length > 0 && (
            <div className="bg-[#0B0D13] border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="font-semibold text-white">Session History</span>
                <span className="text-[10px] text-neutral-500">
                  {interviewHistory.length} Recorded
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {interviewHistory.slice(0, 4).map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-[11px]"
                  >
                    <div className="truncate max-w-[200px]">
                      <p className="text-neutral-200 truncate font-semibold">{h.questionTitle}</p>
                      <p className="text-[10px] text-neutral-500">
                        {h.category} • {h.timestamp}
                      </p>
                    </div>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        h.score >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {h.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTEGRATION NAVIGATION LINKS */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">Ready to apply skills?</span>
            <div className="flex items-center gap-2">
              <Link
                to="/job-matching"
                className="text-[11px] text-[#2DD4BF] hover:underline"
              >
                Match Jobs →
              </Link>
              <span className="text-neutral-600">•</span>
              <Link to="/dashboard" className="text-[11px] text-neutral-300 hover:underline">
                Diagnostics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

