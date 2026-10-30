import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { setTargetRole, addSkill } = useCareerStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPages = [
    { title: "Go to Diagnostics Dashboard", path: "/dashboard", desc: "View readiness score, radar charts, and dynamic roadmap" },
    { title: "Resume Analyzer & ATS Scanner", path: "/resume-analyzer", desc: "Upload PDF or paste text for OCR extraction and ATS score" },
    { title: "AI Mock Interview Suite", path: "/interview", desc: "Interactive technical & behavioral practice with real-time scoring" },
    { title: "Role Compatibility & Job Matching", path: "/job-matching", desc: "Match your verified skills with top tech openings & analyze JDs" },
    { title: "Platform Admin Command Center", path: "/admin", desc: "Telemetry, candidate registry, benchmark tracks, and system health" },
    { title: "Go to Role Benchmark Matrix", path: "/roles", desc: "Explore hiring standards and benchmark tracks" },
    { title: "Go to What-If Career Lab", path: "/simulator", desc: "Simulate adding hypothetical frameworks" },
    { title: "Go to 3D Career Constellation", path: "/universe", desc: "Interactive Three.js spatial graph" },
    { title: "Overview / Landing Page", path: "/", desc: "Platform features, architecture, and technology overview" },
  ];

  const filteredPages = quickPages.filter(
    (p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRoles = BENCHMARK_ROLES.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectPage = (path) => {
    navigate(path);
    onClose();
  };

  const handleSelectRole = (roleId) => {
    setTargetRole(roleId);
    navigate("/dashboard");
    onClose();
  };

  const handleAddCustomSkill = () => {
    if (query.trim()) {
      addSkill(query.trim());
      navigate("/dashboard");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="ui-card rounded-2xl max-w-xl w-full border border-border shadow-2xl overflow-hidden font-mono text-xs"
        >
          {/* Search Input Bar */}
          <div className="p-3.5 border-b border-border flex items-center gap-2.5 bg-[#0A0C13]">
            <span className="text-textMuted font-bold">⌘</span>
            <input
              type="text"
              autoFocus
              placeholder="Search actions, switch target role, or type skill to add..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-textPrimary placeholder-textMuted outline-none"
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-textMuted">
              ESC
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-3">
            {/* Direct Skill Add Option */}
            {query.trim().length > 1 && (
              <div>
                <span className="text-[10px] text-textMuted uppercase tracking-wider px-2 block mb-1">
                  Add to My Verified Stack
                </span>
                <button
                  onClick={handleAddCustomSkill}
                  className="w-full text-left p-2 rounded-lg bg-[#141724] border border-border hover:border-accent text-accent flex justify-between items-center"
                >
                  <span>+ Add "{query.trim()}" to my skills</span>
                  <span className="text-[10px] text-textMuted">Enter ↵</span>
                </button>
              </div>
            )}

            {/* Navigation Pages */}
            <div>
              <span className="text-[10px] text-textMuted uppercase tracking-wider px-2 block mb-1">
                Navigation
              </span>
              <div className="space-y-1">
                {filteredPages.map((page) => (
                  <button
                    key={page.path}
                    onClick={() => handleSelectPage(page.path)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#141724] text-textPrimary hover:text-accent flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{page.title}</p>
                      <p className="text-[10px] text-textSecondary">{page.desc}</p>
                    </div>
                    <span className="text-textMuted text-[10px]">Jump →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Set Target Goal Roles */}
            {filteredRoles.length > 0 && (
              <div>
                <span className="text-[10px] text-textMuted uppercase tracking-wider px-2 block mb-1">
                  Set as Active Target Career Goal
                </span>
                <div className="space-y-1">
                  {filteredRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role.id)}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#141724] text-textPrimary hover:text-accent flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="font-semibold">🎯 Target: {role.title}</p>
                        <p className="text-[10px] text-textSecondary">{role.demand}% Market Demand</p>
                      </div>
                      <span className="text-accent text-[10px]">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
