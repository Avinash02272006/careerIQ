import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../lib/apiClient";
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";

const CANONICAL_SYNONYMS = {
  reactjs: "React", "react.js": "React", react: "React",
  nextjs: "Next.js", "next.js": "Next.js", next: "Next.js",
  vuejs: "Vue.js", "vue.js": "Vue.js", vue: "Vue.js",
  ts: "TypeScript", typescript: "TypeScript",
  js: "JavaScript", javascript: "JavaScript", es6: "JavaScript",
  html5: "HTML", html: "HTML", css3: "CSS", css: "CSS",
  tailwind: "Tailwind CSS", tailwindcss: "Tailwind CSS", "tailwind css": "Tailwind CSS",
  nodejs: "Node.js", "node.js": "Node.js", node: "Node.js",
  expressjs: "Express", "express.js": "Express", express: "Express",
  py: "Python", python3: "Python", python: "Python",
  fastapi: "FastAPI", django: "Django", flask: "Flask",
  postgres: "PostgreSQL", postgresql: "PostgreSQL", psql: "PostgreSQL",
  mongo: "MongoDB", mongodb: "MongoDB",
  redis: "Redis", sqlite: "SQLite", sql: "SQL",
  docker: "Docker", k8s: "Kubernetes", kubernetes: "Kubernetes",
  aws: "AWS", "amazon web services": "AWS", ec2: "AWS", s3: "AWS",
  gcp: "GCP", "google cloud": "GCP", azure: "Azure",
  "ci/cd": "CI/CD", cicd: "CI/CD", "ci cd": "CI/CD",
  git: "Git", github: "Git", "github actions": "GitHub Actions",
  rest: "REST APIs", "rest api": "REST APIs", "rest apis": "REST APIs",
  microservices: "Microservices", graphql: "GraphQL",
  ml: "Machine Learning", "machine learning": "Machine Learning",
  dl: "Deep Learning", "deep learning": "Deep Learning",
  pytorch: "PyTorch", torch: "PyTorch", tensorflow: "TensorFlow",
  "scikit-learn": "Scikit-Learn", sklearn: "Scikit-Learn",
  pandas: "Pandas", numpy: "NumPy", nlp: "NLP", llms: "LLMs",
  "three.js": "Three.js", threejs: "Three.js", webgl: "WebGL", "framer motion": "Framer Motion",
  figma: "Figma", "ui design": "UI Design", "ux research": "UX Research"
};

function normalizeSkill(s) {
  const clean = s.trim().toLowerCase();
  return CANONICAL_SYNONYMS[clean] || s.trim();
}

const EXTENSIVE_JOB_CATALOG = [
  {
    id: "job-stripe-fs",
    title: "Senior Full Stack Platform Engineer",
    company: "Stripe",
    location: "San Francisco, CA (Remote Friendly)",
    role_category: "fullstack",
    role_id: "role-fs",
    salary_range: "$175,000 - $225,000",
    experience_level: "Senior (4+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 1,
    description: "Architect high-throughput checkout workflows, merchant analytics portals, and distributed billing services with React, Node.js, and PostgreSQL.",
    required_skills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "REST APIs", "Docker", "Git"],
    preferred_skills: ["Redis", "AWS", "Microservices", "CI/CD"],
    benefits: ["$20k sign-on bonus", "Comprehensive health/dental 100%", "Home office equipment allowance", "Unlimited PTO"],
    department: "Global Developer Platform"
  },
  {
    id: "job-vercel-fs",
    title: "Full Stack Edge Infrastructure Developer",
    company: "Vercel",
    location: "San Francisco, CA / Remote",
    role_category: "fullstack",
    role_id: "role-fs",
    salary_range: "$160,000 - $205,000",
    experience_level: "Mid-Senior (3+ YOE)",
    workplace_type: "Remote",
    posted_days_ago: 2,
    description: "Build deployment dashboards, real-time edge middleware integrations, and reactive web applications powering millions of websites.",
    required_skills: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs", "Git"],
    preferred_skills: ["PostgreSQL", "Docker", "Redis", "Three.js"],
    benefits: ["Annual retreat stipend", "401(k) match up to 5%", "Flexible hours", "Full health coverage"],
    department: "Frameworks & Developer Experience"
  },
  {
    id: "job-netflix-fs",
    title: "Full Stack Studio Applications Engineer",
    company: "Netflix",
    location: "Los Gatos, CA (Hybrid)",
    role_category: "fullstack",
    role_id: "role-fs",
    salary_range: "$220,000 - $310,000",
    experience_level: "Senior (5+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 3,
    description: "Develop mission-critical production toolsets for international content creation, combining React frontends with resilient microservices backends.",
    required_skills: ["React", "JavaScript", "TypeScript", "Node.js", "SQL", "PostgreSQL", "REST APIs", "Docker"],
    preferred_skills: ["GraphQL", "AWS", "Kubernetes", "System Design"],
    benefits: ["Top of personal market compensation", "Flexible vacation policy", "Full medical coverage", "Parental leave"],
    department: "Studio Production Tools"
  },
  {
    id: "job-figma-fe",
    title: "Senior Frontend Canvas Engineer",
    company: "Figma",
    location: "San Francisco, CA / Remote",
    role_category: "frontend",
    role_id: "role-fe",
    salary_range: "$170,000 - $220,000",
    experience_level: "Senior (4+ YOE)",
    workplace_type: "Remote",
    posted_days_ago: 1,
    description: "Engineer interactive web editors, 60fps canvas layout engines, and design token pipelines in React, TypeScript, and modern Web APIs.",
    required_skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Git"],
    preferred_skills: ["Three.js", "WebGL", "Figma", "Design Systems"],
    benefits: ["Competitive equity", "Health & mental wellness stipend", "Home office budget"],
    department: "Core Design System"
  },
  {
    id: "job-airbnb-fe",
    title: "Frontend Design Systems Developer",
    company: "Airbnb",
    location: "San Francisco, CA / Remote",
    role_category: "frontend",
    role_id: "role-fe",
    salary_range: "$155,000 - $195,000",
    experience_level: "Mid-Senior (3+ YOE)",
    workplace_type: "Remote",
    posted_days_ago: 4,
    description: "Maintain Airbnb's unified client component ecosystem, ensuring zero layout shift, accessibility compliance, and sub-100ms interaction latency.",
    required_skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Git"],
    preferred_skills: ["Figma", "Redux", "Jest", "UI Design"],
    benefits: ["$2,000 annual travel credit", "Health insurance", "Ergonomic desk allowance"],
    department: "Guest UI Infrastructure"
  },
  {
    id: "job-datadog-be",
    title: "Backend Microservices & Pipeline Engineer",
    company: "Datadog",
    location: "New York, NY (Hybrid)",
    role_category: "backend",
    role_id: "role-be",
    salary_range: "$165,000 - $215,000",
    experience_level: "Mid-Senior (3+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 2,
    description: "Build high-throughput telemetry ingestion services, REST/gRPC gateways, distributed cache strategies, and relational database schemas.",
    required_skills: ["Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "REST APIs", "Redis", "Microservices"],
    preferred_skills: ["Kubernetes", "AWS", "Kafka", "System Design"],
    benefits: ["Commuter benefits", "Health insurance", "Gym reimbursement", "Stock options"],
    department: "Core Telemetry Services"
  },
  {
    id: "job-uber-be",
    title: "Staff Backend Distributed Systems Engineer",
    company: "Uber",
    location: "Seattle, WA / San Francisco, CA",
    role_category: "backend",
    role_id: "role-be",
    salary_range: "$190,000 - $255,000",
    experience_level: "Senior (5+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 3,
    description: "Scale geospatial matching algorithms, transactional fare ledgers, and low-latency microservices handling millions of concurrent trips.",
    required_skills: ["Python", "SQL", "PostgreSQL", "REST APIs", "Docker", "Redis", "Microservices", "Data Structures"],
    preferred_skills: ["Go", "Kafka", "Kubernetes", "System Design"],
    benefits: ["Uber ride credits", "Competitive 401(k) match", "Generous equity grant"],
    department: "Marketplace Dynamics"
  },
  {
    id: "job-hashi-devops",
    title: "Cloud Infrastructure & Platform Architect",
    company: "HashiCorp",
    location: "Remote (Worldwide)",
    role_category: "systems",
    role_id: "role-devops",
    salary_range: "$160,000 - $205,000",
    experience_level: "Senior (4+ YOE)",
    workplace_type: "Remote",
    posted_days_ago: 1,
    description: "Provision resilient multi-cloud container clusters, automate zero-downtime deployment pipelines with GitHub Actions, and write production Terraform.",
    required_skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Git"],
    preferred_skills: ["Python", "Go", "GitHub Actions", "GCP"],
    benefits: ["Remote work equipment package", "Unlimited PTO", "Health & dental 100%"],
    department: "Cloud Ecosystem Engineering"
  },
  {
    id: "job-anthropic-ai",
    title: "AI Applications & RAG Systems Engineer",
    company: "Anthropic",
    location: "San Francisco, CA (In-Office)",
    role_category: "ai_ml",
    role_id: "role-ai",
    salary_range: "$200,000 - $280,000",
    experience_level: "Senior (4+ YOE)",
    workplace_type: "Onsite",
    posted_days_ago: 1,
    description: "Build high-throughput LLM agent architectures, vector database retrieval pipelines (pgvector), and automated model alignment eval harnesses.",
    required_skills: ["Python", "Machine Learning", "Deep Learning", "PyTorch", "NLP", "REST APIs", "Docker"],
    preferred_skills: ["LangChain", "LLMs", "Scikit-Learn", "FastAPI"],
    benefits: ["Top-tier equity package", "Catered daily breakfast & lunch", "Unlimited wellness credits"],
    department: "Model Applications & Alignment"
  },
  {
    id: "job-openai-ai",
    title: "Inference Optimization & ML Infrastructure Engineer",
    company: "OpenAI",
    location: "San Francisco, CA (Hybrid)",
    role_category: "ai_ml",
    role_id: "role-ai",
    salary_range: "$230,000 - $320,000",
    experience_level: "Senior (5+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 2,
    description: "Deploy distributed model inference clusters, minimize GPU memory latency, and implement semantic prompt caches with Python and PyTorch.",
    required_skills: ["Python", "Machine Learning", "Deep Learning", "PyTorch", "NLP", "Docker", "REST APIs"],
    preferred_skills: ["Kubernetes", "LLMs", "Generative AI", "C++"],
    benefits: ["Exceptional equity packages", "Annual education allowance", "Comprehensive health"],
    department: "Inference Platform"
  },
  {
    id: "job-google-swe",
    title: "Software Engineer (Systems & Algorithms)",
    company: "Google",
    location: "Mountain View, CA / New York, NY",
    role_category: "systems",
    role_id: "role-swe",
    salary_range: "$175,000 - $245,000",
    experience_level: "Mid-Senior (3+ YOE)",
    workplace_type: "Hybrid",
    posted_days_ago: 1,
    description: "Design core algorithmic search indexing, optimize memory allocation in high-throughput services, and architect resilient distributed systems.",
    required_skills: ["Data Structures", "Algorithms", "System Design", "Problem Solving", "Git", "SQL"],
    preferred_skills: ["Python", "C++", "Java", "Distributed Systems"],
    benefits: ["World-class culinary dining", "401(k) match", "Parental leave", "Peer learning budget"],
    department: "Core Infrastructure"
  }
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
  const [customTitle, setCustomTitle] = useState("Target Tech Role");
  const [jdAnalysis, setJdAnalysis] = useState(null);
  const [analyzingJD, setAnalyzingJD] = useState(false);

  // Accurate client-side matching engine with synonym resolution
  const computeLocalMatches = (candSkills) => {
    const candNormalized = new Set(candSkills.map((s) => normalizeSkill(s).toLowerCase()));

    const computed = EXTENSIVE_JOB_CATALOG.map((j) => {
      const matchedReq = [];
      const missingReq = [];
      j.required_skills.forEach((r) => {
        if (candNormalized.has(normalizeSkill(r).toLowerCase())) {
          matchedReq.push(r);
        } else {
          missingReq.push(r);
        }
      });

      const matchedPref = [];
      (j.preferred_skills || []).forEach((p) => {
        if (candNormalized.has(normalizeSkill(p).toLowerCase())) {
          matchedPref.push(p);
        }
      });

      const reqRatio = matchedReq.length / max(j.required_skills.length, 1);
      const prefRatio =
        j.preferred_skills?.length > 0
          ? matchedPref.length / j.preferred_skills.length
          : 1.0;

      const matchPct = Math.min(
        100,
        Math.round(reqRatio * 80 + prefRatio * 20)
      );

      const fitLevel =
        matchPct >= 88
          ? "Exceptional Fit (90%+)"
          : matchPct >= 72
          ? "High Match (75-89%)"
          : matchPct >= 55
          ? "Solid Competency (60-74%)"
          : "Skill Growth Opportunity";

      return {
        ...j,
        match_percentage: matchPct,
        fit_level: fitLevel,
        matched_skills: matchedReq,
        missing_skills: missingReq,
        matched_preferred: matchedPref,
        match_highlights: `You match ${matchedReq.length} of ${j.required_skills.length} core technical requirements.`
      };
    });

    computed.sort((a, b) => b.match_percentage - a.match_percentage);
    setJobs(computed);
  };

  function max(a, b) {
    return a > b ? a : b;
  }

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
      // Local fallback with synonym matching
      const candNorm = new Set(candSkills.map((s) => normalizeSkill(s).toLowerCase()));
      const knownSkills = ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST APIs", "AWS", "Python", "SQL", "Redis"];
      const jdLower = customJD.toLowerCase();

      const extracted = knownSkills.filter((sk) => jdLower.includes(sk.toLowerCase()));
      const sampleExtracted = extracted.length > 0 ? extracted : ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"];

      const matched = sampleExtracted.filter((s) => candNorm.has(normalizeSkill(s).toLowerCase()));
      const missing = sampleExtracted.filter((s) => !candNorm.has(normalizeSkill(s).toLowerCase()));
      const pct = Math.round((matched.length / max(sampleExtracted.length, 1)) * 100);

      setJdAnalysis({
        job_title: customTitle,
        match_percentage: pct,
        extracted_skills_count: sampleExtracted.length,
        required_skills: sampleExtracted,
        matched_skills: matched,
        missing_skills: missing,
        recommendations: [
          `Add projects highlighting missing keywords: ${missing.slice(0, 3).join(", ") || "cloud deployment"}.`,
          "Mirror exact keywords from the JD in your resume summary.",
        ],
        verdict: pct >= 75 ? "Competitive Candidate (Ready to Apply)" : "Moderate Gap - Needs Keyword Alignment",
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
              Canonical Skill Synonyms • Live Industry Openings
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white font-normal tracking-tight">
            Skill Compatibility & Job Matching
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Benchmark your resume and verified technical skills against real tech positions.
            Review match percentages, highlight missing skills, and paste any external JD for instant ATS compatibility.
          </p>
        </div>

        {/* CANDIDATE STATUS */}
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
            to="/resume-analyzer"
            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            ATS Scanner →
          </Link>
        </div>
      </div>

      {/* ACCURACY BANNER */}
      {hasAnalyzedResume && (
        <div className="p-3.5 rounded-xl bg-[#0C121E] border border-[#2DD4BF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#2DD4BF]">✓</span>
            <span className="text-neutral-300 font-sans">
              Matches computed for your resume: <strong className="text-white">{candidateName}</strong> with{" "}
              <strong className="text-[#2DD4BF]">{skills.length} verified technical competencies</strong>.
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            Canonical Matching Active
          </span>
        </div>
      )}

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

        {/* SEARCH & FILTERS */}
        {activeTab !== "jd-analyzer" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter by title, company, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#08090C] border border-white/[0.08] focus:border-[#2DD4BF] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 outline-none w-full sm:w-56 font-sans"
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
                        <span className="text-[10px] text-neutral-400 font-sans">{job.location}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-400">
                          {job.workplace_type}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-white font-sans">{job.title}</h2>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-sans">
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
                      <span className="text-[10px] text-neutral-400 font-mono">
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
                          ✓ Matched ({job.matched_skills.length}):
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
                          ▲ Skill Gap ({job.missing_skills.length}):
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
                        Practice Interview →
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
                  <h3 className="text-base font-semibold text-white font-sans">{jdAnalysis.job_title}</h3>
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
