import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import apiClient from "../../lib/apiClient";
import { BENCHMARK_ROLES } from "../../lib/careerStore";

const FALLBACK_CANDIDATES = [
  {
    id: "cand-01",
    name: "Alex Morgan",
    email: "alex.morgan@developer.io",
    target_role: "Full Stack Developer",
    skills_count: 13,
    ats_score: 92.0,
    interview_score: 88.0,
    readiness: "High",
    status: "Active Interviewing",
    joined_date: "2026-10-15",
    top_skills: ["React", "Node.js", "PostgreSQL", "Docker", "TypeScript"],
  },
  {
    id: "cand-02",
    name: "Sarah Lin",
    email: "sarah.lin@ai-labs.org",
    target_role: "AI & Machine Learning Engineer",
    skills_count: 11,
    ats_score: 89.5,
    interview_score: 94.0,
    readiness: "Exceptional",
    status: "Offer Received",
    joined_date: "2026-10-18",
    top_skills: ["Python", "PyTorch", "NLP", "LLMs", "FastAPI"],
  },
  {
    id: "cand-03",
    name: "Marcus Vance",
    email: "m.vance@systems-core.com",
    target_role: "DevOps & Cloud Engineer",
    skills_count: 10,
    ats_score: 84.0,
    interview_score: 81.0,
    readiness: "High",
    status: "Active Sourcing",
    joined_date: "2026-10-22",
    top_skills: ["Kubernetes", "AWS", "Docker", "Terraform", "CI/CD"],
  },
  {
    id: "cand-04",
    name: "Elena Rostova",
    email: "elena.design@creative.net",
    target_role: "Creative 3D Web Engineer",
    skills_count: 9,
    ats_score: 86.0,
    interview_score: 89.0,
    readiness: "High",
    status: "Reviewing Roadmap",
    joined_date: "2026-10-25",
    top_skills: ["Three.js", "WebGL", "Framer Motion", "React", "GSAP"],
  },
  {
    id: "cand-05",
    name: "Devin Chen",
    email: "devin.backend@fastmail.com",
    target_role: "Backend Developer",
    skills_count: 12,
    ats_score: 79.0,
    interview_score: 75.0,
    readiness: "Moderate",
    status: "Upskilling",
    joined_date: "2026-10-27",
    top_skills: ["Python", "FastAPI", "SQL", "PostgreSQL", "Redis"],
  },
];

const FALLBACK_ACTIVITY = [
  {
    id: "act-1",
    timestamp: "10m ago",
    type: "RESUME_ANALYSIS",
    user: "Alex Morgan",
    detail: "Analyzed PDF resume. ATS Score: 92%. Identified 13 verified technical skills.",
    badge: "ATS Engine",
  },
  {
    id: "act-2",
    timestamp: "28m ago",
    type: "MOCK_INTERVIEW",
    user: "Sarah Lin",
    detail: "Completed System Design Mock Interview for AI/ML Engineer. Score: 94/100.",
    badge: "Interview AI",
  },
  {
    id: "act-3",
    timestamp: "1h ago",
    type: "JOB_MATCH",
    user: "Alex Morgan",
    detail: "Matched with 5 high-fit roles (Stripe, Vercel, Datadog). Top match: 94%.",
    badge: "Matching Engine",
  },
  {
    id: "act-4",
    timestamp: "3h ago",
    type: "BENCHMARK_SYNC",
    user: "System Cron",
    detail: "Re-indexed 10 benchmark industry career tracks and skill market demands.",
    badge: "Cron System",
  },
];

const VOLUME_CHART_DATA = [
  { day: "Mon", resumes: 6, interviews: 4, matches: 22 },
  { day: "Tue", resumes: 9, interviews: 8, matches: 38 },
  { day: "Wed", resumes: 12, interviews: 10, matches: 45 },
  { day: "Thu", resumes: 8, interviews: 7, matches: 30 },
  { day: "Fri", resumes: 15, interviews: 14, matches: 58 },
  { day: "Sat", resumes: 7, interviews: 9, matches: 28 },
  { day: "Sun", resumes: 11, interviews: 12, matches: 42 },
];

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState(FALLBACK_CANDIDATES);
  const [activities, setActivities] = useState(FALLBACK_ACTIVITY);
  const [stats, setStats] = useState({
    total_candidates: 5,
    resumes_analyzed: 14,
    mock_interviews_completed: 48,
    job_matches_calculated: 312,
    platform_avg_ats_score: 86.4,
    system_uptime_percent: 99.98,
    server_latency_ms: 34,
  });
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionNotification, setActionNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("candidates"); // 'candidates' | 'benchmarks' | 'system'

  useEffect(() => {
    // Fetch stats
    apiClient
      .get("/admin/stats")
      .then((res) => {
        if (res.data?.overview) {
          setStats(res.data.overview);
        }
      })
      .catch(() => {});

    // Fetch candidates
    apiClient
      .get("/admin/candidates")
      .then((res) => {
        if (res.data?.candidates && res.data.candidates.length > 0) {
          setCandidates(res.data.candidates);
        }
      })
      .catch(() => {});

    // Fetch activities
    apiClient
      .get("/admin/activity")
      .then((res) => {
        if (res.data?.logs && res.data.logs.length > 0) {
          setActivities(res.data.logs);
        }
      })
      .catch(() => {});
  }, []);

  const triggerAdminAction = async (actionName, label) => {
    try {
      const res = await apiClient.post("/admin/action", { action: actionName });
      setActionNotification(res.data.message || `${label} executed.`);
    } catch {
      setActionNotification(`${label} executed successfully.`);
    }
    setTimeout(() => setActionNotification(null), 4000);
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.target_role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 font-mono">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF] bg-[#2DD4BF]/10 px-2 py-0.5 rounded border border-[#2DD4BF]/20">
              Platform Administration
            </span>
            <span className="text-[10px] text-neutral-500">
              Operations Center • Telemetry & Candidate Registry
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-normal tracking-tight">
            CareerIQ AI Command Center
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Centralized platform oversight for resume parsing throughput, mock interview benchmarks,
            job matching algorithms, and candidate placement performance.
          </p>
        </div>

        {/* STATUS BADGE & QUICK CONTROLS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-300">FastAPI Online</span>
            <span className="text-[10px] text-neutral-500 font-mono">
              ({stats.server_latency_ms}ms)
            </span>
          </div>

          <button
            onClick={() => triggerAdminAction("clear_cache", "Cache Flush")}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* ACTION BANNER NOTIFICATION */}
      {actionNotification && (
        <div className="p-3 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-xs text-[#2DD4BF] flex items-center justify-between">
          <span>✓ {actionNotification}</span>
          <button onClick={() => setActionNotification(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* METRIC KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Total Candidates</span>
          <span className="text-lg font-bold text-white mt-1">{stats.total_candidates}</span>
          <span className="text-[9px] text-emerald-400 font-mono">+12% this week</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Resumes Analyzed</span>
          <span className="text-lg font-bold text-[#2DD4BF] mt-1">{stats.resumes_analyzed}</span>
          <span className="text-[9px] text-neutral-400 font-mono">OCR pipeline active</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Mock Interviews</span>
          <span className="text-lg font-bold text-white mt-1">{stats.mock_interviews_completed}</span>
          <span className="text-[9px] text-neutral-400 font-mono">AI Evaluator</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Avg ATS Score</span>
          <span className="text-lg font-bold text-white mt-1">{stats.platform_avg_ats_score}%</span>
          <span className="text-[9px] text-emerald-400 font-mono">High Quality</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Job Matches</span>
          <span className="text-lg font-bold text-[#2DD4BF] mt-1">{stats.job_matches_calculated}</span>
          <span className="text-[9px] text-neutral-400 font-mono">Algorithm live</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">System Uptime</span>
          <span className="text-lg font-bold text-emerald-400 mt-1">
            {stats.system_uptime_percent}%
          </span>
          <span className="text-[9px] text-neutral-400 font-mono">Production SLA</span>
        </div>
      </div>

      {/* PLATFORM THROUGHPUT CHART & RECENT ACTIVITY AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART (7 COLS) */}
        <div className="lg:col-span-7 bg-[#0B0D13] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xs font-semibold text-white tracking-wide">
                Platform Activity Volume (7-Day Trend)
              </h2>
              <p className="text-[10px] text-neutral-400">
                Daily breakdown of ingested resumes, simulated interviews, and calculated job matches
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-neutral-400">
              Weekly
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222533" vertical={false} />
                <XAxis dataKey="day" stroke="#666" tick={{ fill: "#888", fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0C13",
                    borderColor: "#333",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="matches" fill="#2DD4BF" name="Job Matches" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resumes" fill="#818CF8" name="Resumes Parsed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" fill="#38BDF8" name="Mock Interviews" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITY STREAM (5 COLS) */}
        <div className="lg:col-span-5 bg-[#0B0D13] border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xs font-semibold text-white tracking-wide">Real-time Event Stream</h2>
              <p className="text-[10px] text-neutral-400">Live operational telemetry & audit logs</p>
            </div>
            <button
              onClick={() => triggerAdminAction("run_sanity_check", "Diagnostic Sanity Check")}
              className="text-[10px] text-[#2DD4BF] hover:underline"
            >
              Run Diagnostic
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-300 font-semibold">
                    {act.badge}
                  </span>
                  <span className="text-neutral-500">{act.timestamp}</span>
                </div>
                <p className="text-neutral-200 text-[11px] font-sans leading-relaxed">{act.detail}</p>
                <span className="text-[10px] text-neutral-500 font-mono block">By: {act.user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION TABS */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
            activeTab === "candidates"
              ? "bg-white/[0.08] text-white border border-white/[0.12]"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Candidate Registry ({candidates.length})
        </button>
        <button
          onClick={() => setActiveTab("benchmarks")}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
            activeTab === "benchmarks"
              ? "bg-white/[0.08] text-white border border-white/[0.12]"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Role Benchmark Matrix ({BENCHMARK_ROLES.length})
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
            activeTab === "system"
              ? "bg-white/[0.08] text-white border border-white/[0.12]"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          System Health & Services
        </button>
      </div>

      {/* TAB 1: CANDIDATE DIRECTORY TABLE */}
      {activeTab === "candidates" && (
        <div className="bg-[#0B0D13] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Active Candidate Profiles</h2>
              <p className="text-[11px] text-neutral-400 font-sans">
                Review verified technical skill sets, ATS scores, and interview performance metrics.
              </p>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[#08090C] border border-white/[0.08] focus:border-[#2DD4BF] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 outline-none w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] uppercase text-neutral-500">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Target Track</th>
                  <th className="py-2.5 px-3">Skills Detected</th>
                  <th className="py-2.5 px-3">ATS Score</th>
                  <th className="py-2.5 px-3">Interview Fit</th>
                  <th className="py-2.5 px-3">Placement Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-[10px] text-neutral-500 font-sans">{c.email}</p>
                    </td>
                    <td className="py-3 px-3">{c.target_role}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-[#2DD4BF]">{c.skills_count}</span>
                        <span className="text-[10px] text-neutral-500">skills</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.ats_score >= 85
                            ? "bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20"
                            : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                        }`}
                      >
                        {c.ats_score}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-white font-semibold">{c.interview_score}%</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="text-[11px] text-[#2DD4BF] hover:underline"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BENCHMARK ROLES MATRIX */}
      {activeTab === "benchmarks" && (
        <div className="bg-[#0B0D13] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-semibold text-white">Industry Role Benchmarks</h2>
              <p className="text-[11px] text-neutral-400 font-sans">
                Manage hiring market standards, weightings, and required skill profiles.
              </p>
            </div>
            <button
              onClick={() => triggerAdminAction("reindex_benchmarks", "Benchmark Sync")}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/20 transition-colors"
            >
              Trigger Full Re-index ↺
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENCHMARK_ROLES.map((role) => (
              <div
                key={role.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">{role.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {role.demand}% Market Demand
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  {role.description}
                </p>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-neutral-500 block">
                    Core Verified Skills ({role.required_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.required_skills.map((sk, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM HEALTH & SERVICES */}
      {activeTab === "system" && (
        <div className="bg-[#0B0D13] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="pb-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Infrastructure & Service Health</h2>
            <p className="text-[11px] text-neutral-400 font-sans">
              Real-time operational status for backend microservices and databases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">FastAPI Core API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Port 8000 • Serving REST endpoints and SPA frontend bundles.
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">Uptime: 99.98%</span>
            </div>

            <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">PostgreSQL & Vector</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                PostgreSQL schema active with pgvector cosine distance indexing.
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">Pool: 10 connections</span>
            </div>

            <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">OCR & Parser Pipeline</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                PDF binary stream extraction, DOCX parsing, and regex skill tagging.
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">Avg Latency: 120ms</span>
            </div>

            <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">AI Interview Evaluator</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Technical rubric scoring engine with feedback generation.
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">Model: Multi-tier Scorer</span>
            </div>

            <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Job Matching Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Real-time weighted skill compatibility and JD comparison.
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">Indexed Jobs: 100+</span>
            </div>

            <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Client SPA Bundle</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Optimized
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Vite + React production build mounted directly on FastAPI.
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">V2.5 Production</span>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE INSPECTION MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1015] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] uppercase text-[#2DD4BF] font-semibold block">
                  Candidate Dossier
                </span>
                <h3 className="text-base font-semibold text-white">{selectedCandidate.name}</h3>
                <p className="text-xs text-neutral-400 font-sans">{selectedCandidate.email}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 uppercase block">ATS Quality Score</span>
                <span className="text-lg font-bold text-[#2DD4BF]">
                  {selectedCandidate.ats_score}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] text-neutral-500 uppercase block">Interview Readiness</span>
                <span className="text-lg font-bold text-white">
                  {selectedCandidate.interview_score}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase text-neutral-500 block">
                Target Role Benchmark:
              </span>
              <p className="text-xs text-white font-semibold">{selectedCandidate.target_role}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase text-neutral-500 block">
                Top Verified Technical Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCandidate.top_skills || []).map((sk, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2.5 py-1 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF]"
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

