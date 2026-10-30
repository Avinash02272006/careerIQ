import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";

const stackGroups = [
  {
    category: "Cloud & DevOps",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform"],
  },
  {
    category: "Backend & Systems",
    skills: ["Node.js", "Express", "FastAPI", "Python", "PostgreSQL", "Redis", "REST APIs", "Microservices"],
  },
  {
    category: "Frontend & Architecture",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Angular", "Vue.js", "Redux"],
  },
  {
    category: "AI & Machine Learning",
    skills: ["Machine Learning", "Deep Learning", "PyTorch", "Scikit-Learn", "NLP", "Pandas"],
  },
  {
    category: "Interactive 3D & Creative",
    skills: ["Three.js", "Framer Motion", "WebGL", "GSAP"],
  },
];

export default function CareerSimulator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    skills: userSkills,
    targetRoleId,
    setTargetRole,
    commitSimulatedSkills,
    resumeQuality,
  } = useCareerStore();

  const paramRoleTitle = searchParams.get("role") || "";
  const initialRole =
    BENCHMARK_ROLES.find(
      (r) =>
        r.title.toLowerCase() === paramRoleTitle.toLowerCase() ||
        r.id === targetRoleId
    ) || BENCHMARK_ROLES[0];

  const [activeRole, setActiveRole] = useState(initialRole);
  const [selectedHypoSkills, setSelectedHypoSkills] = useState(["Docker", "TypeScript"]);
  const [notice, setNotice] = useState(false);

  // Live projected metrics
  const roleReqs = activeRole.required_skills;
  const currentMatches = roleReqs.filter((s) =>
    userSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const currentComp = roleReqs.length > 0 ? Math.round((currentMatches.length / roleReqs.length) * 100) : 0;

  const combinedSkills = [
    ...new Set([
      ...userSkills,
      ...selectedHypoSkills.filter(
        (hs) => !userSkills.some((cs) => cs.toLowerCase() === hs.toLowerCase())
      ),
    ]),
  ];

  const projectedMatches = roleReqs.filter((s) =>
    combinedSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const projectedComp = roleReqs.length > 0 ? Math.round((projectedMatches.length / roleReqs.length) * 100) : 0;

  const currentReadiness = Math.min(
    Math.round(resumeQuality * 0.4 + userSkills.length * 4.5 + 20),
    100
  );
  const projectedReadiness = Math.min(
    Math.round(resumeQuality * 0.4 + combinedSkills.length * 4.5 + 20),
    100
  );

  const newlyUnlocked = selectedHypoSkills.filter(
    (s) =>
      roleReqs.some((r) => r.toLowerCase() === s.toLowerCase()) &&
      !userSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  // Chart data
  const comparisonChartData = [
    {
      metric: "Role Compatibility",
      Current: currentComp,
      Projected: projectedComp,
    },
    {
      metric: "Readiness Score",
      Current: currentReadiness,
      Projected: projectedReadiness,
    },
  ];

  const toggleSkill = (skill) => {
    if (selectedHypoSkills.includes(skill)) {
      setSelectedHypoSkills(selectedHypoSkills.filter((s) => s !== skill));
    } else {
      setSelectedHypoSkills([...selectedHypoSkills, skill]);
    }
  };

  const handleCommit = () => {
    commitSimulatedSkills(selectedHypoSkills);
    setTargetRole(activeRole.id);
    setNotice(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1100);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1E212D]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#10131E] border border-[#222738] text-[#2DD4BF]">
              What-If Predictive Simulation Lab
            </span>
          </div>
          <h1 className="font-display font-semibold text-xl text-white">Career Skill Simulator</h1>
          <p className="text-xs text-[#94A3B8]">
            Test adding hypothetical technologies to forecast their exact impact on your readiness score and market fit.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs text-[#94A3B8] hover:text-white underline"
        >
          Back to Diagnostics Console
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-lg bg-[#0F2922] border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs flex justify-between items-center shadow-lg">
          <span>✓ Applied {selectedHypoSkills.join(", ")} to your active verified skills!</span>
          <span className="font-mono text-[11px] animate-pulse">Redirecting to console...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* LEFT: CONTROLS & SKILL TOGGLES */}
        <div className="md:col-span-6 ui-card p-5 space-y-4">
          <div>
            <label className="text-xs text-[#94A3B8] block mb-1 font-medium">Select Target Position</label>
            <select
              value={activeRole.id}
              onChange={(e) => {
                const found = BENCHMARK_ROLES.find((r) => r.id === e.target.value);
                if (found) setActiveRole(found);
              }}
              className="w-full bg-[#0E1017] border border-[#1E212D] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#2DD4BF]"
            >
              {BENCHMARK_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.demand}% Demand)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#94A3B8] font-medium">Select Skills to Test:</span>
              <span className="text-[11px] text-[#2DD4BF] font-mono">{selectedHypoSkills.length} selected</span>
            </div>

            {stackGroups.map((grp) => (
              <div key={grp.category} className="space-y-1">
                <span className="text-[11px] text-[#64748B] block font-mono">{grp.category}</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {grp.skills.map((skill) => {
                    const isSelected = selectedHypoSkills.includes(skill);
                    const isKnown = userSkills.some((cs) => cs.toLowerCase() === skill.toLowerCase());
                    return (
                      <button
                        key={skill}
                        disabled={isKnown}
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          isKnown
                            ? "bg-[#0A0B10] text-[#475569] border border-transparent cursor-not-allowed"
                            : isSelected
                            ? "bg-[#2DD4BF] text-black font-semibold shadow-sm"
                            : "bg-[#0E1017] border border-[#1E212D] text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : isKnown ? `${skill} (Verified)` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: PROJECTIONS & RECHARTS COMPARISON */}
        <div className="md:col-span-6 space-y-4">
          <div className="ui-card p-5 space-y-4">
            <h2 className="font-semibold text-sm text-white">Projected Career Lift</h2>

            {/* RECHARTS COMPARISON BAR GRAPH */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1D2A" vertical={false} />
                  <XAxis dataKey="metric" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 10 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D0F17",
                      borderColor: "#222738",
                      fontSize: "11px",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar name="Current Score" dataKey="Current" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar name="Projected with Tested Skills" dataKey="Projected" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#0E1017] border border-[#1A1D27] space-y-1">
                <span className="text-[11px] text-[#64748B] block">Role Match Lift</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-2xl text-[#2DD4BF]">{projectedComp}%</span>
                  <span className="text-xs text-[#64748B] line-through">{currentComp}%</span>
                </div>
                <span className="text-[11px] text-[#2DD4BF]">+{projectedComp - currentComp}% boost</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0E1017] border border-[#1A1D27] space-y-1">
                <span className="text-[11px] text-[#64748B] block">Readiness Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-2xl text-white">{projectedReadiness}</span>
                  <span className="text-xs text-[#64748B] line-through">{currentReadiness}</span>
                </div>
                <span className="text-[11px] text-[#94A3B8]">+{projectedReadiness - currentReadiness} pts</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <span className="text-[#64748B] block">Satisfies requirements for {activeRole.title}:</span>
              {newlyUnlocked.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {newlyUnlocked.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#0F2922] text-[#2DD4BF] font-mono text-[11px]">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#64748B] italic text-[11px]">No direct matches among selected hypothetical skills.</p>
              )}
            </div>

            <button
              onClick={handleCommit}
              disabled={selectedHypoSkills.length === 0}
              className="w-full py-2.5 rounded-lg bg-[#2DD4BF] text-black font-semibold text-xs hover:bg-[#26bba8] disabled:opacity-40 transition-colors shadow-md mt-2"
            >
              Apply Tested Skills to My Active Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
