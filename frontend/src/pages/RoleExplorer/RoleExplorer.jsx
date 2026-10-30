import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";
import apiClient from "../../lib/apiClient";

export default function RoleExplorer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [successToast, setSuccessToast] = useState(null);
  const [roles, setRoles] = useState(BENCHMARK_ROLES);

  const { targetRoleId, setTargetRole, getRoleCompatibility, skills } = useCareerStore();
  const userSkillsLower = skills.map((s) => s.toLowerCase());

  // Try fetching live roles from backend
  useEffect(() => {
    apiClient
      .get("/roles")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Merge with benchmark roles format
          const formatted = res.data.map((r) => {
            const reqSkills = (r.required_skills || []).map((item) =>
              typeof item === "string" ? item : item.skill || item.name
            );
            return {
              id: r.id,
              title: r.title,
              description: r.description,
              demand: Math.round((r.market_demand_index || 0.85) * 100),
              required_skills: reqSkills,
              category: r.title.toLowerCase().includes("frontend")
                ? "frontend"
                : r.title.toLowerCase().includes("backend")
                ? "backend"
                : r.title.toLowerCase().includes("ai") || r.title.toLowerCase().includes("data")
                ? "ai_ml"
                : r.title.toLowerCase().includes("devops")
                ? "systems"
                : r.title.toLowerCase().includes("designer")
                ? "design"
                : "fullstack",
            };
          });
          setRoles(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: "all", label: "All Benchmark Tracks" },
    { id: "fullstack", label: "Full Stack" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend" },
    { id: "ai_ml", label: "AI & Data Science" },
    { id: "systems", label: "DevOps & Systems" },
    { id: "design", label: "UI/UX Design" },
  ];

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.required_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || role.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleSetTarget = (role) => {
    setTargetRole(role.id);
    setSuccessToast(`Target goal updated: ${role.title}`);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1E212D]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#10131E] border border-[#222738] text-[#2DD4BF]">
              Industry Hiring Standards
            </span>
          </div>
          <h1 className="font-display font-semibold text-xl text-white">Role Benchmarks & Matrix</h1>
          <p className="text-xs text-[#94A3B8]">
            Compare your verified skill stack against modern engineering hiring standards and calibrate your study roadmap.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Filter roles or skills (e.g. React, Docker, Python)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#0E1017] border border-[#1E212D] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#2DD4BF] w-full sm:w-64"
        />
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              categoryFilter === cat.id
                ? "bg-[#2DD4BF] text-black font-semibold shadow-sm"
                : "bg-[#0E1017] border border-[#1E212D] text-[#94A3B8] hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {successToast && (
        <div className="p-3 rounded-lg bg-[#0F2922] border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs flex justify-between items-center shadow-lg animate-fade-in">
          <span>✓ {successToast}</span>
          <button
            onClick={() => navigate("/dashboard")}
            className="underline font-semibold hover:text-white"
          >
            Open Diagnostics Console →
          </button>
        </div>
      )}

      {/* ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoles.map((role) => {
          const isTarget = targetRoleId === role.id;
          const fitMatch = getRoleCompatibility(role.id);

          return (
            <div
              key={role.id}
              className={`ui-card p-5 flex flex-col justify-between space-y-4 transition-all ${
                isTarget
                  ? "border-[#2DD4BF]/60 bg-[#0F1420] shadow-md ring-1 ring-[#2DD4BF]/30"
                  : "hover:border-[#2DD4BF]/30"
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div>
                    <h3 className="font-semibold text-sm text-white">{role.title}</h3>
                    <span className="text-[11px] text-[#64748B] font-mono">{role.demand}% Market Demand</span>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      fitMatch >= 80
                        ? "bg-[#0F2922] text-[#2DD4BF] border border-[#2DD4BF]/30"
                        : fitMatch >= 50
                        ? "bg-[#1E1B10] text-amber-300 border border-amber-500/30"
                        : "bg-[#1A1115] text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {fitMatch}% Fit
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed mb-3 line-clamp-2">
                  {role.description}
                </p>

                {/* Skills tags with status indicators */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-mono">
                    Required Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {role.required_skills.map((skillName) => {
                      const hasSkill = userSkillsLower.includes(skillName.toLowerCase());
                      return (
                        <span
                          key={skillName}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 ${
                            hasSkill
                              ? "bg-[#0A1616] border border-[#2DD4BF]/30 text-[#2DD4BF]"
                              : "bg-[#0A0B10] border border-[#1A1D27] text-[#94A3B8]"
                          }`}
                        >
                          <span>{hasSkill ? "✓" : "+"}</span>
                          <span>{skillName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1E212D] flex items-center justify-between text-xs">
                {isTarget ? (
                  <span className="text-[#2DD4BF] font-semibold text-xs flex items-center gap-1">
                    ✓ Active Target Benchmark
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetTarget(role)}
                    className="text-[#94A3B8] hover:text-[#2DD4BF] underline text-xs font-medium"
                  >
                    Set as Target Goal
                  </button>
                )}

                <button
                  onClick={() => navigate(`/simulator?role=${encodeURIComponent(role.title)}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#141722] border border-[#222738] text-[#E2E8F0] hover:border-[#2DD4BF] text-xs transition-colors font-medium"
                >
                  Simulate Fit →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
