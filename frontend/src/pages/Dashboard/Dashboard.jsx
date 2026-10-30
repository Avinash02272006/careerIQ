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

const roleRoadmaps = {
  "role-fs": [
    {
      week: 1,
      topic: "Docker Containerization for Node & Express",
      resource: "Official Docker Docs",
      tasks: [
        "Write multi-stage Dockerfile for Express API",
        "Configure Docker Compose for Node and PostgreSQL",
      ],
    },
    {
      week: 2,
      topic: "API Caching & Queues with Redis",
      resource: "Redis University",
      tasks: [
        "Implement cache-aside pattern on high-throughput GET endpoints",
        "Add rate limiting middleware in Express",
      ],
    },
    {
      week: 3,
      topic: "System Scaling & PostgreSQL Optimization",
      resource: "PostgreSQL Performance Guide",
      tasks: [
        "Analyze query execution plans with EXPLAIN ANALYZE",
        "Design index and replication strategies",
      ],
    },
  ],
  "role-fe": [
    {
      week: 1,
      topic: "Next.js App Router & Server Components",
      resource: "Next.js Documentation",
      tasks: [
        "Build server components and dynamic routing",
        "Optimize bundle size and render performance",
      ],
    },
    {
      week: 2,
      topic: "State Synchronization with Zustand",
      resource: "Zustand Docs",
      tasks: ["Implement persistent client state slices", "Configure type-safe store actions"],
    },
  ],
  "role-be": [
    {
      week: 1,
      topic: "PostgreSQL & Database Optimization",
      resource: "PostgreSQL Tutorial",
      tasks: ["Write optimized SQL joins", "Implement connection pooling"],
    },
    {
      week: 2,
      topic: "Service Containerization with Docker",
      resource: "Docker Docs",
      tasks: ["Containerize backend microservices", "Set up volume mounts for development"],
    },
  ],
  "role-devops": [
    {
      week: 1,
      topic: "Kubernetes Core Architecture",
      resource: "Kubernetes Guide",
      tasks: ["Write deployment manifests", "Configure service networking"],
    },
    {
      week: 2,
      topic: "CI/CD Pipeline Automation",
      resource: "GitHub Actions",
      tasks: ["Automate test suites", "Configure container build pipelines"],
    },
  ],
  "role-ai": [
    {
      week: 1,
      topic: "PyTorch Model Training & Tensors",
      resource: "PyTorch Tutorials",
      tasks: ["Build multi-layer perceptron", "Implement custom DataLoader"],
    },
    {
      week: 2,
      topic: "NLP & LLM Prompt Pipelines",
      resource: "Hugging Face Guides",
      tasks: ["Fine-tune transformer tokenizer", "Deploy inference API with FastAPI"],
    },
  ],
  "role-creative-3d": [
    {
      week: 1,
      topic: "Three.js WebGL & Scene Setup",
      resource: "Three.js Journey",
      tasks: ["Build custom particle geometry buffers", "Bind mouse raycaster coordinates"],
    },
    {
      week: 2,
      topic: "Spring Physics with Framer Motion",
      resource: "Framer Motion API",
      tasks: ["Implement layoutId shared animations", "Configure spring physics gestures"],
    },
  ],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "graphs" | "rawtext" | "skills"
  const [newSkillInput, setNewSkillInput] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  const {
    hasAnalyzedResume,
    rawExtractedText,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateLinks,
    skills,
    addSkill,
    removeSkill,
    resetSkills,
    loadSampleDemo,
    targetRoleId,
    setTargetRole,
    completedTasks,
    toggleTask,
    getReadinessScore,
    getRoleCompatibility,
    getTargetRoleGaps,
    getDomainRadarMetrics,
    resumeQuality,
    atsAudit,
    projects,
    experience,
  } = useCareerStore();

  const readiness = getReadinessScore();
  const activeRole =
    BENCHMARK_ROLES.find((r) => r.id === targetRoleId) || BENCHMARK_ROLES[0];
  const compatibility = getRoleCompatibility(targetRoleId);
  const gaps = getTargetRoleGaps();
  const roadmap = roleRoadmaps[targetRoleId] || roleRoadmaps["role-fs"];
  const radarMetrics = getDomainRadarMetrics();

  // Competency comparison data for target role
  const userSkillsLower = skills.map((s) => s.toLowerCase());
  const roleCompetencyData = activeRole.required_skills.map((skillName) => {
    const isMatched = userSkillsLower.includes(skillName.toLowerCase());
    return {
      skill: skillName,
      match: isMatched ? 100 : 0,
      status: isMatched ? "Verified Competency" : "Need to Upgrade",
    };
  });

  // Market Tracks Fit Data
  const marketTracksData = BENCHMARK_ROLES.map((role) => {
    const score = getRoleCompatibility(role.id);
    return {
      id: role.id,
      role: role.title.replace("Developer", "Dev").replace("Engineer", "Eng"),
      fit: score,
      demand: role.demand,
      fullTitle: role.title,
    };
  });

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

  // ============================================================
  // EMPTY STATE: If no resume has been uploaded yet
  // ============================================================
  if (!hasAnalyzedResume) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 w-full flex flex-col items-center space-y-8">
        <div className="text-center space-y-3">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-400 block">
            Placement Readiness Console
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-[-0.03em] text-white">
            No Resume Analyzed Yet
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Upload your resume document (PDF, PNG, JPG image, Word .docx, or plain text) to extract your actual skills, audit your ATS score, and generate your placement readiness graphs.
          </p>
        </div>

        <div className="w-full max-w-md p-8 rounded-2xl bg-[#0E1015] border border-white/[0.08] text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs text-[#2DD4BF]">
            ATS
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">Start Document Extraction</h3>
            <p className="text-xs text-neutral-400">
              Extract exact text, competencies, and role gaps in under 2 seconds.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate("/upload")}
              className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-md font-mono"
            >
              Upload Resume (PDF / Image / Word) →
            </button>

            <button
              onClick={loadSampleDemo}
              className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-400 hover:text-white font-mono text-xs transition-colors"
            >
              Or Load Sample Candidate Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ANALYZED STATE: Live genuine metrics & graphs
  // ============================================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#2DD4BF]">
              Analyzed Profile: {candidateName || "Candidate"}
            </span>
            {candidateEmail && (
              <span className="font-mono text-[10px] text-neutral-500">
                • {candidateEmail}
              </span>
            )}
          </div>
          <h1 className="font-display font-light text-2xl text-white tracking-tight">
            Placement Diagnostics
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => navigate("/interview")}
            className="px-3 py-1.5 rounded-lg bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 text-[#2DD4BF] font-mono text-[11px] transition-colors"
          >
            Practice Interview →
          </button>
          <button
            onClick={() => navigate("/job-matching")}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white font-mono text-[11px] transition-colors"
          >
            Match Jobs →
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 font-mono text-[11px] transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="px-3 py-1.5 rounded-lg font-medium bg-white text-black hover:bg-neutral-200 font-mono text-[11px] transition-colors shadow-sm"
          >
            Resume Analyzer
          </button>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex border-b border-white/[0.06] text-xs gap-6">
        {[
          { id: "overview", label: "Overview & Graphs" },
          { id: "graphs", label: "Market Fit Matrix" },
          { id: "rawtext", label: "Extracted Raw Text & Audit" },
          { id: "skills", label: `Verified Skills (${skills.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-mono text-[11px] tracking-wider uppercase transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-white text-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & GRAPHS */}
      {/* ============================================================ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* TOP METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Card */}
            <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-400 block">
                Readiness Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-light text-4xl text-white">{readiness}</span>
                <span className="font-mono text-xs text-neutral-500">/ 100</span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2DD4BF] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(readiness || 0, 100)}%` }}
                />
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between font-mono text-[10px] text-neutral-400">
                <span>ATS Quality: {resumeQuality}%</span>
                <span>Verified Skills: {skills.length}</span>
              </div>
            </div>

            {/* Target Compatibility Card */}
            <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-400 block">
                Target Role Match
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-light text-4xl text-white">{compatibility}%</span>
                <span className="font-mono text-xs text-neutral-500">Fit</span>
              </div>
              <p className="text-xs text-neutral-300 truncate font-medium">{activeRole.title}</p>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between font-mono text-[10px]">
                <span className={gaps.length > 0 ? "text-amber-400" : "text-emerald-400"}>
                  {gaps.length > 0 ? `Missing: ${gaps.length} skills` : "All skills verified"}
                </span>
                <button onClick={() => navigate("/roles")} className="text-[#2DD4BF] hover:underline">
                  Change Track
                </button>
              </div>
            </div>

            {/* Roadmap Progress Card */}
            <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-400 block">
                Study Roadmap
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-light text-4xl text-white">{progressPct}%</span>
                <span className="font-mono text-xs text-neutral-500">
                  ({completedCount}/{totalTasks} tasks)
                </span>
              </div>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2DD4BF] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="pt-2 border-t border-white/[0.06] font-mono text-[10px] text-neutral-400 flex justify-between">
                <span>{roadmap.length} Week Plan</span>
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
                <p className="text-xs font-semibold text-white font-mono">Recommended Platform Workflows</p>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Practice technical interview questions for {activeRole.title} or benchmark against live job openings.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate("/interview")}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors font-mono"
              >
                AI Mock Interview →
              </button>
              <button
                onClick={() => navigate("/job-matching")}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] text-xs transition-colors font-mono"
              >
                Match Tech Jobs →
              </button>
            </div>
          </div>

          {/* VISUAL GRAPHS ROW: RADAR & GAP GRAPH */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* SPIDER / RADAR GRAPH */}
            <div className="md:col-span-6 p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase text-neutral-400">
                    Skill Domain Distribution
                  </h3>
                  <p className="text-xs text-white">Radar: Candidate vs Benchmark</p>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.08] text-[#2DD4BF]">
                  Radar Chart
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
                      name="Candidate Score"
                      dataKey="candidateScore"
                      stroke="#2DD4BF"
                      fill="#2DD4BF"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="benchmarkScore"
                      stroke="#818CF8"
                      strokeDasharray="3 3"
                      fill="#818CF8"
                      fillOpacity={0.08}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0A0C10",
                        borderColor: "#1A1D26",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#2DD4BF" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", fontFamily: "monospace" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* COMPETENCY GAP BAR GRAPH */}
            <div className="md:col-span-6 p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase text-neutral-400">
                    Target Competency Status
                  </h3>
                  <p className="text-xs text-white">{activeRole.title} Requirements</p>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.08] text-neutral-300">
                  Gap Graph
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={roleCompetencyData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#141720" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#525866", fontSize: 10 }} unit="%" />
                    <YAxis
                      dataKey="skill"
                      type="category"
                      tick={{ fill: "#C8CDD8", fontSize: 11, fontFamily: "monospace" }}
                      width={85}
                    />
                    <Tooltip
                      formatter={(val, name, item) => [
                        val === 100 ? "✓ Verified (100%)" : "✕ Need to Upgrade",
                        item.payload.skill,
                      ]}
                      contentStyle={{
                        backgroundColor: "#0A0C10",
                        borderColor: "#1A1D26",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="match" radius={[0, 4, 4, 0]}>
                      {roleCompetencyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.match === 100 ? "#2DD4BF" : "#F43F5E"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* LOWER: NEED TO UPGRADE & ROADMAP */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Need to Upgrade */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-neutral-400">
                  Need to Upgrade ({gaps.length})
                </h3>
                <button
                  onClick={() => navigate(`/simulator?role=${encodeURIComponent(activeRole.title)}`)}
                  className="font-mono text-[11px] text-[#2DD4BF] hover:underline"
                >
                  Test in Lab →
                </button>
              </div>

              {gaps.length > 0 ? (
                <div className="space-y-2">
                  {gaps.map((gap) => (
                    <div
                      key={gap.skill_name}
                      className="p-3 rounded-xl bg-[#0A0C10] border border-white/[0.06] flex items-center justify-between text-xs hover:border-white/[0.15] transition-colors"
                    >
                      <div>
                        <span className="text-white font-medium block">{gap.skill_name}</span>
                        <span className="font-mono text-[10px] text-[#2DD4BF]">
                          +{gap.estimated_gain} pts lift
                        </span>
                      </div>
                      <button
                        onClick={() => addSkill(gap.skill_name)}
                        className="font-mono text-[11px] px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/[0.2]"
                      >
                        + Mark Learned
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-mono py-6 text-center">
                  ✓ All core skills for this role are satisfied!
                </p>
              )}
            </div>

            {/* Study Roadmap */}
            <div className="md:col-span-7 p-5 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-neutral-400">
                  Weekly Study Roadmap
                </h3>
                <span className="font-mono text-[11px] text-[#2DD4BF]">{progressPct}% Done</span>
              </div>

              <div className="space-y-3">
                {roadmap.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-xl bg-[#0A0C10] border border-white/[0.06] space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-white">
                        Week {sIdx + 1}: {step.topic}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">{step.resource}</span>
                    </div>

                    <div className="space-y-1.5 pl-0.5">
                      {step.tasks.map((task, tIdx) => {
                        const taskId = `${targetRoleId}-${sIdx}-${tIdx}`;
                        const isDone = !!completedTasks[taskId];
                        return (
                          <label
                            key={tIdx}
                            className="flex items-start gap-2 text-xs text-neutral-400 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleTask(taskId)}
                              className="mt-0.5 rounded border-white/[0.2] bg-black text-[#2DD4BF] focus:ring-0"
                            />
                            <span className={isDone ? "line-through text-neutral-600" : ""}>
                              {task}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MARKET FIT MATRIX */}
      {/* ============================================================ */}
      {activeTab === "graphs" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-medium text-white">Industry Compatibility Matrix</h2>
                <p className="text-xs text-neutral-400">
                  Click any track bar to recalibrate your target goal and learning roadmap.
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#2DD4BF]">10 Benchmark Roles</span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketTracksData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#141720" vertical={false} />
                  <XAxis
                    dataKey="role"
                    tick={{ fill: "#8A91A5", fontSize: 10, fontFamily: "monospace" }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: "#525866", fontSize: 10 }} unit="%" />
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${val}% (${item.payload.fullTitle})`,
                      name === "fit" ? "Candidate Match" : "Market Demand",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0A0C10",
                      borderColor: "#1A1D26",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", fontFamily: "monospace" }} />
                  <Bar
                    name="Candidate Match %"
                    dataKey="fit"
                    fill="#2DD4BF"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => {
                      if (data && data.id) {
                        setTargetRole(data.id);
                      }
                    }}
                    cursor="pointer"
                  >
                    {marketTracksData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.id === targetRoleId ? "#2DD4BF" : "#1A2E2C"}
                      />
                    ))}
                  </Bar>
                  <Bar
                    name="Market Demand Index"
                    dataKey="demand"
                    fill="#818CF8"
                    opacity={0.5}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: EXTRACTED RAW TEXT & AUDIT */}
      {/* ============================================================ */}
      {activeTab === "rawtext" && (
        <div className="space-y-6">
          {/* ATS QUALITY AUDIT */}
          {atsAudit && (
            <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
                <h2 className="text-sm font-medium text-white">ATS Quality & Content Diagnostics</h2>
                <span className="font-mono text-xl text-[#2DD4BF] font-light">
                  {atsAudit.overall_score}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-white/[0.06]">
                  <span className="text-neutral-500 text-[10px] block">Sections</span>
                  <span className="text-white text-base font-light">
                    {atsAudit.breakdown?.section_completeness || 30} / 30
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-white/[0.06]">
                  <span className="text-neutral-500 text-[10px] block">Action Verbs</span>
                  <span className="text-white text-base font-light">
                    {atsAudit.breakdown?.action_verbs || 22} / 25
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-white/[0.06]">
                  <span className="text-neutral-500 text-[10px] block">Impact Metrics</span>
                  <span className="text-white text-base font-light">
                    {atsAudit.breakdown?.quantified_impact || 20} / 25
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-white/[0.06]">
                  <span className="text-neutral-500 text-[10px] block">Keyword Density</span>
                  <span className="text-white text-base font-light">
                    {atsAudit.breakdown?.keyword_density || 16} / 20
                  </span>
                </div>
              </div>

              {atsAudit.suggestions && atsAudit.suggestions.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 block">
                    Actionable Improvements:
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {atsAudit.suggestions.map((sug, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/20 text-amber-200"
                      >
                        • {sug}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXACT RAW EXTRACTED TEXT INSPECTION */}
          <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-medium text-white">Exact Extracted Raw Text</h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Characters extracted by OCR / PDF parser: {rawExtractedText.length}
                </p>
              </div>
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="font-mono text-xs text-[#2DD4BF] hover:underline"
              >
                {showRawText ? "Collapse view" : "Expand full view"}
              </button>
            </div>

            <pre className={`p-4 rounded-xl bg-[#08090C] border border-white/[0.06] text-[11px] font-mono text-neutral-300 overflow-y-auto whitespace-pre-wrap leading-relaxed ${
              showRawText ? "max-h-[600px]" : "max-h-60"
            }`}>
              {rawExtractedText || "No raw text available."}
            </pre>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: SKILLS MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === "skills" && (
        <div className="p-6 rounded-2xl bg-[#0E1015] border border-white/[0.08] space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-medium text-white">Verified Technical Skills</h2>
              <p className="text-xs text-neutral-400">
                Competencies detected from your uploaded resume or manually verified.
              </p>
            </div>
            <button
              onClick={resetSkills}
              className="font-mono text-[11px] text-neutral-500 hover:text-white underline"
            >
              Clear & Reset
            </button>
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Docker, TypeScript, Redis, Kubernetes)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              className="flex-1 bg-[#0A0C10] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 outline-none focus:border-white/[0.3] font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 font-mono"
            >
              + Add
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[#0A0C10] border border-white/[0.08] text-neutral-200 flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-neutral-500 hover:text-rose-400 font-bold"
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
