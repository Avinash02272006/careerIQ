import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../lib/apiClient";
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";

const FALLBACK_JOBS = [
  {
    id: "job-101",
    title: "Senior Full Stack Engineer",
    company: "Stripe",
    location: "San Francisco, CA (Remote / Hybrid)",
    role_category: "fullstack",
    role_id: "role-fs",
    salary_range: "$165,000 - $210,000",
    experience_level: "Senior (4+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 2,
    description:
      "Build world-class developer billing tools, reactive merchant dashboards, and high-throughput transactional APIs with React, Node.js, and PostgreSQL.",
    required_skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Express",
      "PostgreSQL",
      "REST APIs",
      "Docker",
      "Git",
    ],
    preferred_skills: ["Redis", "AWS", "Microservices"],
    benefits: ["Equity grants", "Health/Dental 100%", "Home office budget", "Unlimited PTO"],
    department: "Core Infrastructure",
  },
  {
    id: "job-102",
    title: "Full Stack Platform Developer",
    company: "Vercel",
    location: "Remote (US & Global)",
    role_category: "fullstack",
    role_id: "role-fs",
    salary_range: "$150,000 - $190,000",
    experience_level: "Mid-Senior (3+ YOE)",
    workplace_type: "Remote",
    posted_days_ago: 1,
    description:
      "Join our team engineering next-generation deployment dashboards, edge middleware integrations, and reactive web applications.",
    required_skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Tailwind CSS",
      "REST APIs",
      "Git",
    ],
    preferred_skills: ["Three.js", "PostgreSQL", "Docker"],
    benefits: ["Remote work stipend", "Annual company retreats", "Learning budget"],
    department: "Developer Experience",
  },
  {
    id: "job-103",
    title: "Frontend Architect / Senior UI Engineer",
    company: "Figma",
    location: "San Francisco, CA / Remote",
    role_category: "frontend",
    role_id: "role-fe",
    salary_range: "$170,000 - $225,000",
    experience_level: "Senior (5+ YOE)",
    workplace_type: "Remote",
    posted_days_ago: 3,
    description:
      "Develop high-performance browser canvas experiences, custom web components, and fluid layout design tools in React and TypeScript.",
    required_skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Git",
    ],
    preferred_skills: ["Three.js", "WebGL", "Figma", "Design Systems"],
    benefits: ["Comprehensive medical", "401(k) match", "Parental leave"],
    department: "Design Systems & Editor",
  },
  {
    id: "job-104",
    title: "Backend Microservices Engineer",
    company: "Datadog",
    location: "New York, NY (Hybrid)",
    role_category: "backend",
    role_id: "role-be",
    salary_range: "$160,000 - $205,000",
    experience_level: "Mid-Senior (3+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 4,
    description:
      "Design and scale low-latency telemetry pipelines, REST & gRPC microservices, distributed cache layers, and relational storage engines.",
    required_skills: [
      "Python",
      "FastAPI",
      "SQL",
      "PostgreSQL",
      "Docker",
      "REST APIs",
      "Redis",
      "Microservices",
    ],
    preferred_skills: ["Kubernetes", "AWS", "Kafka", "Data Structures"],
    benefits: ["Commuter benefits", "Wellness subsidy", "Competitive equity"],
    department: "Distributed Systems",
  },
  {
    id: "job-105",
    title: "DevOps & Cloud Infrastructure Specialist",
    company: "HashiCorp",
    location: "Remote (Worldwide)",
    role_category: "systems",
    role_id: "role-devops",
    salary_range: "$155,000 - $195,000",
    experience_level: "Mid-Senior (3+ YOE)",
    workplace_type: "Remote",
    posted_days_ago: 5,
    description:
      "Automate multi-region AWS/GCP infrastructure with Terraform, build immutable container pipelines, and harden Kubernetes production clusters.",
    required_skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Git"],
    preferred_skills: ["Python", "Go", "GitHub Actions"],
    benefits: ["Flexible hours", "Full healthcare", "Equipment package"],
    department: "Cloud Platforms",
  },
  {
    id: "job-106",
    title: "AI & LLM Applications Engineer",
    company: "Anthropic",
    location: "San Francisco, CA (In-Office)",
    role_category: "ai_ml",
    role_id: "role-ai",
    salary_range: "$190,000 - $260,000",
    experience_level: "Senior (4+ YOE)",
    workplace_type: "Onsite",
    posted_days_ago: 1,
    description:
      "Create state-of-the-art agent evaluation harnesses, RAG context retrieval pipelines, and high-throughput model inference endpoints.",
    required_skills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "PyTorch",
      "NLP",
      "REST APIs",
      "Docker",
    ],
    preferred_skills: ["LangChain", "LLMs", "Scikit-Learn", "FastAPI"],
    benefits: ["Top-tier equity", "Daily catered meals", "Comprehensive medical & wellness"],
    department: "Model Applications",
  },
];

export default function JobMatching() {
  const navigate = useNavigate();
  const {
    skills,
    hasAnalyzedResume,
    candidateName,
    targetRoleId,
    setTargetRole,
    savedJobIds,
    toggleSaveJob,
    appliedJobIds,
    applyToJob,
    loadSampleDemo,
  } = useCareerStore();

  const [activeTab, setActiveTab] = useState("matches"); // 'matches' | 'saved' | 'applied' | 'jd-analyzer'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWorkplace, setSelectedWorkplace] = useState("all");
  const [minMatchFilter, setMinMatchFilter] = useState(0);
  const [expandedJobId, setExpandedJobId] = useState(null);

  // Custom JD Analyzer state
  const [customJD, setCustomJD] = useState("");
  const [customTitle, setCustomTitle] = useState("Custom Tech Role");
  const [jdAnalysis, setJdAnalysis] = useState(null);
  const [analyzingJD, setAnalyzingJD] = useState(false);

  // Fetch or calculate matching jobs
  useEffect(() => {
    setLoading(true);
    const candidateSkills =
      skills.length > 0
        ? skills
        : ["React", "JavaScript", "TypeScript", "Node.js", "Express", "PostgreSQL", "SQL", "Git", "Docker"];

    apiClient
      .post("/jobs/match", {
        skills: candidateSkills,
        target_role: targetRoleId,
        min_match_pct: 0,
      })
      .then((res) => {
        if (res.data?.matches && res.data.matches.length > 0) {
          setJobs(res.data.matches);
        } else {
          computeLocalMatches(candidateSkills);
        }
      })
      .catch(() => {
        computeLocalMatches(candidateSkills);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [skills, targetRoleId]);

  const computeLocalMatches = (candSkills) => {
    const candLower = new Set(candSkills.map((s) => s.toLowerCase()));
    const computed = FALLBACK_JOBS.map((j) => {
      const matchedReq = j.required_skills.filter((s) => candLower.has(s.toLowerCase()));
      const missingReq = j.required_skills.filter((s) => !candLower.has(s.toLowerCase()));
      const matchedPref = (j.preferred_skills || []).filter((s) => candLower.has(s.toLowerCase()));
      const matchPct = Math.min(
        100,
        Math.round((matchedReq.length / j.required_skills.length) * 85 + (matchedPref.length > 0 ? 15 : 0))
      );
      return {
        ...j,
        match_percentage: matchPct,
        fit_level: matchPct >= 80 ? "High Match" : matchPct >= 60 ? "Strong Fit" : "Growth Opportunity",
        matched_skills: matchedReq,
        missing_skills: missingReq,
        matched_preferred: matchedPref,
        match_highlights: `Matches ${matchedReq.length} of ${j.required_skills.length} core requirements.`,
      };
    });
    computed.sort((a, b) => b.match_percentage - a.match_percentage);
    setJobs(computed);
  };

  const handleAnalyzeCustomJD = async () => {
    if (!customJD.trim()) return;
    setAnalyzingJD(true);

    const candSkills =
      skills.length > 0
        ? skills
        : ["React", "JavaScript", "TypeScript", "Node.js", "Express", "PostgreSQL", "SQL", "Git", "Docker"];

    try {
      const res = await apiClient.post("/jobs/analyze-jd", {
        job_title: customTitle,
        job_description: customJD,
        candidate_skills: candSkills,
      });
      setJdAnalysis(res.data);
    } catch {
      // Local fallback
      const candLower = new Set(candSkills.map((s) => s.toLowerCase()));
      const sampleExtracted = ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST APIs", "AWS"];
      const matched = sampleExtracted.filter((s) => candLower.has(s.toLowerCase()));
      const missing = sampleExtracted.filter((s) => !candLower.has(s.toLowerCase()));
      const pct = Math.round((matched.length / sampleExtracted.length) * 100);

      setJdAnalysis({
        job_title: customTitle,
        match_percentage: pct,
        extracted_skills_count: sampleExtracted.length,
        required_skills: sampleExtracted,
        matched_skills: matched,
        missing_skills: missing,
        recommendations: [
          `Highlight experience with ${missing.slice(0, 2).join(" & ")} in your projects section.`,
          "Mirror exact keywords from the JD in your resume summary.",
        ],
        verdict: pct >= 75 ? "Competitive Candidate" : "Moderate Gap - Needs Keyword Alignment",
      });
    } finally {
      setAnalyzingJD(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (activeTab === "saved" && !savedJobIds.includes(j.id)) return false;
    if (activeTab === "applied" && !appliedJobIds.includes(j.id)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = j.title.toLowerCase().includes(q);
      const matchComp = j.company.toLowerCase().includes(q);
      const matchSkill = j.required_skills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchComp && !matchSkill) return false;
    }

    if (selectedCategory !== "all" && j.role_category !== selectedCategory) {
      return false;
    }

    if (selectedWorkplace !== "all" && j.workplace_type.toLowerCase() !== selectedWorkplace.toLowerCase()) {
      return false;
    }

    if (minMatchFilter > 0 && j.match_percentage < minMatchFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 font-mono">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF] bg-[#2DD4BF]/10 px-2 py-0.5 rounded border border-[#2DD4BF]/20">
              Placement Matching Engine
            </span>
            <span className="text-[10px] text-neutral-500">
              Live Career Benchmarks • Automated Skill Fit
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-normal tracking-tight">
            Role Compatibility & Job Matching
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Instantly benchmark your resume and verified technical skills against real tech positions.
            Review match percentages, identify skill gaps, and track applications.
          </p>
        </div>

        {/* STATUS & RESUME QUICK LOADER */}
        <div className="flex items-center gap-2">
          {!hasAnalyzedResume ? (
            <button
              onClick={loadSampleDemo}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/20 transition-colors"
            >
              Load Sample Profile
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span className="text-white font-semibold">{candidateName || "Candidate"}</span>
              <span className="text-neutral-500">({skills.length} skills)</span>
            </div>
          )}

          <Link
            to="/upload"
            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            ATS Scanner →
          </Link>
        </div>
      </div>

      {/* TOP METRICS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Active Openings</span>
          <span className="text-xs font-semibold text-white mt-1">{jobs.length} Positions</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Highest Match</span>
          <span className="text-xs font-semibold text-[#2DD4BF] mt-1">
            {jobs.length > 0 ? `${jobs[0].match_percentage}% (${jobs[0].company})` : "N/A"}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Saved Roles</span>
          <span className="text-xs font-semibold text-white mt-1">{savedJobIds.length} bookmarked</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] uppercase text-neutral-500">Applications Submitted</span>
          <span className="text-xs font-semibold text-[#2DD4BF] mt-1">
            {appliedJobIds.length} in pipeline
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
              activeTab === "matches"
                ? "bg-white/[0.08] text-white border border-white/[0.12]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Matched Opportunities ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
              activeTab === "saved"
                ? "bg-white/[0.08] text-white border border-white/[0.12]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Saved ({savedJobIds.length})
          </button>
          <button
            onClick={() => setActiveTab("applied")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
              activeTab === "applied"
                ? "bg-white/[0.08] text-white border border-white/[0.12]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Applied ({appliedJobIds.length})
          </button>
          <button
            onClick={() => setActiveTab("jd-analyzer")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
              activeTab === "jd-analyzer"
                ? "bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30"
                : "text-[#2DD4BF] hover:bg-[#2DD4BF]/10"
            }`}
          >
            ★ Custom JD vs Resume Scanner
          </button>
        </div>

        {/* SEARCH & WORKPLACE FILTER */}
        {activeTab !== "jd-analyzer" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter by title, company, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#08090C] border border-white/[0.08] focus:border-[#2DD4BF] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 outline-none w-full sm:w-56"
            />
            <select
              value={selectedWorkplace}
              onChange={(e) => setSelectedWorkplace(e.target.value)}
              className="bg-[#08090C] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: MATCHED JOBS LIST */}
      {activeTab !== "jd-analyzer" && (
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-[#0B0D13] border border-white/[0.06] rounded-2xl p-12 text-center space-y-3">
              <span className="text-3xl block">🔍</span>
              <h3 className="text-sm font-semibold text-white">No Matching Roles Found</h3>
              <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">
                Try loosening your search filters or add additional technologies to your verified stack.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const isApplied = appliedJobIds.includes(job.id);
              const isExpanded = expandedJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="bg-[#0B0D13] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 sm:p-6 transition-all space-y-4 shadow-xl"
                >
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                          {job.company}
                        </span>
                        <span className="text-[10px] text-neutral-500">•</span>
                        <span className="text-[10px] text-neutral-400">{job.location}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-400">
                          {job.workplace_type}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-white font-sans">{job.title}</h2>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        <span className="text-emerald-400 font-semibold">{job.salary_range}</span>
                        <span>•</span>
                        <span>{job.experience_level}</span>
                        <span>•</span>
                        <span>Posted {job.posted_days_ago}d ago</span>
                      </div>
                    </div>

                    {/* Match Score Gauge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                            job.match_percentage >= 80
                              ? "bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/30"
                              : job.match_percentage >= 60
                              ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                              : "bg-neutral-500/10 text-neutral-400 border-white/[0.08]"
                          }`}
                        >
                          <span className="text-sm">{job.match_percentage}%</span>
                          <span className="text-[10px] font-normal uppercase">Match</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {job.fit_level}
                      </span>
                    </div>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills Pills Matrix */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    {/* Matched skills */}
                    {job.matched_skills && job.matched_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[#2DD4BF] font-semibold uppercase mr-1">
                          ✓ Matched Skills ({job.matched_skills.length}):
                        </span>
                        {job.matched_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF]"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Missing skills gap */}
                    {job.missing_skills && job.missing_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-amber-400 font-semibold uppercase mr-1">
                          ▲ Skill Growth ({job.missing_skills.length}):
                        </span>
                        {job.missing_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-300"
                          >
                            + {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? "bg-white text-black border-white font-semibold"
                            : "bg-white/[0.04] text-neutral-300 border-white/[0.08] hover:text-white"
                        }`}
                      >
                        {isSaved ? "★ Bookmarked" : "☆ Save Job"}
                      </button>

                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.08]"
                      >
                        {isExpanded ? "▲ Less Details" : "▼ Compensation & Perks"}
                      </button>

                      <Link
                        to="/interview"
                        onClick={() => setTargetRole(job.role_id || "role-fs")}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] hover:bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 transition-colors"
                      >
                        Practice Mock Interview →
                      </Link>
                    </div>

                    <button
                      onClick={() => applyToJob(job.id)}
                      disabled={isApplied}
                      className={`text-xs px-5 py-2 rounded-xl font-semibold transition-colors ${
                        isApplied
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                          : "bg-white text-black hover:bg-neutral-200"
                      }`}
                    >
                      {isApplied ? "✓ Applied • In Review" : "1-Click Apply →"}
                    </button>
                  </div>

                  {/* Expanded Details Drawer */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-3 border-t border-white/[0.06] space-y-3 font-sans text-xs text-neutral-300"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#08090C] p-3.5 rounded-xl border border-white/[0.04]">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                            Team & Department
                          </span>
                          <p className="font-semibold text-white">{job.department || "Engineering"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                            Company Benefits
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(job.benefits || []).map((b, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-neutral-300"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 2: INSTANT JOB DESCRIPTION (JD) ANALYZER */}
      {activeTab === "jd-analyzer" && (
        <div className="bg-[#0B0D13] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-[#2DD4BF] tracking-wider block font-semibold">
              External Job Description Diagnostic
            </span>
            <h2 className="text-xl font-semibold text-white font-sans">
              Paste Any Job Description from LinkedIn or Indeed
            </h2>
            <p className="text-xs text-neutral-400 font-sans max-w-xl">
              Compare your current resume and skills against any external job posting. Our engine
              extracts the required tech stack and calculates your instant ATS compatibility match.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase text-neutral-400 block mb-1">Role Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full bg-[#08090C] border border-white/[0.08] focus:border-[#2DD4BF] rounded-xl px-3.5 py-2 text-xs text-white outline-none font-sans"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-neutral-400 block mb-1">
                Job Description Text
              </label>
              <textarea
                rows={8}
                value={customJD}
                onChange={(e) => setCustomJD(e.target.value)}
                placeholder="Paste the complete job post requirements, responsibilities, and qualifications..."
                className="w-full bg-[#08090C] border border-white/[0.08] focus:border-[#2DD4BF] rounded-xl p-3.5 text-xs text-neutral-200 outline-none leading-relaxed font-sans placeholder-neutral-600"
              />
            </div>

            <button
              onClick={handleAnalyzeCustomJD}
              disabled={analyzingJD || !customJD.trim()}
              className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2 disabled:opacity-40"
            >
              {analyzingJD ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Scanning JD against Resume...</span>
                </>
              ) : (
                <span>Compute ATS Match & Keyword Gaps →</span>
              )}
            </button>
          </div>

          {/* JD Analysis Output */}
          {jdAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 border-t border-white/[0.08] space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#121520] border border-[#2DD4BF]/30">
                <div>
                  <span className="text-[10px] uppercase text-[#2DD4BF] font-semibold block">
                    ATS Compatibility
                  </span>
                  <h3 className="text-base font-semibold text-white">{jdAnalysis.job_title}</h3>
                  <p className="text-xs text-neutral-400 font-sans">{jdAnalysis.verdict}</p>
                </div>

                <div className="flex items-baseline gap-1 bg-[#2DD4BF]/10 px-4 py-2 rounded-xl border border-[#2DD4BF]/30">
                  <span className="text-3xl font-light text-[#2DD4BF]">
                    {jdAnalysis.match_percentage}%
                  </span>
                  <span className="text-[10px] text-neutral-400">Match</span>
                </div>
              </div>

              {/* Skills matched vs missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase block">
                    ✓ Matched Keywords ({jdAnalysis.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdAnalysis.matched_skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#08090C] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-amber-400 font-semibold uppercase block">
                    ▲ Missing Keywords in Resume ({jdAnalysis.missing_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdAnalysis.missing_skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-300"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Actionable Resume Tuning Tips:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 font-sans">
                  {jdAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

