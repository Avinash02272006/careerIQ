import { motion } from "framer-motion";
import { useCareerStore, BENCHMARK_ROLES } from "../../lib/careerStore";

export default function ExportReportModal({ isOpen, onClose }) {
  const {
    candidateName,
    candidateEmail,
    skills,
    targetRoleId,
    getReadinessScore,
    getRoleCompatibility,
    getTargetRoleGaps,
    resumeQuality,
  } = useCareerStore();

  if (!isOpen) return null;

  const targetRole = BENCHMARK_ROLES.find((r) => r.id === targetRoleId) || BENCHMARK_ROLES[0];
  const readiness = getReadinessScore();
  const compatibility = getRoleCompatibility(targetRoleId);
  const gaps = getTargetRoleGaps();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="ui-card rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-border shadow-2xl max-h-[90vh] overflow-y-auto font-mono text-xs space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-accent">CareerIQ Diagnostics</span>
              <span className="text-textMuted">• Verified Report</span>
            </div>
            <h2 className="font-display font-bold text-lg text-textPrimary">
              Placement Readiness Evaluation
            </h2>
            <p className="text-[11px] text-textSecondary">
              Generated: {new Date().toLocaleDateString()} • Candidate: {candidateName} ({candidateEmail})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary text-base p-1"
          >
            ✕
          </button>
        </div>

        {/* Scorecard Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#0A0C13] rounded-xl border border-border">
          <div>
            <span className="text-[10px] text-textMuted uppercase block">Readiness Score</span>
            <span className="font-bold text-2xl text-accent">{readiness} / 100</span>
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase block">Target Match</span>
            <span className="font-bold text-2xl text-textPrimary">{compatibility}%</span>
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase block">ATS Quality</span>
            <span className="font-bold text-2xl text-emerald-400">{resumeQuality}%</span>
          </div>
        </div>

        {/* Target Position */}
        <div className="p-3 bg-[#0A0C13] rounded-xl border border-border space-y-1">
          <span className="text-[10px] text-textMuted uppercase block">Target Benchmark Track</span>
          <p className="font-display font-bold text-sm text-textPrimary">{targetRole.title}</p>
          <p className="text-[11px] text-textSecondary leading-relaxed">{targetRole.description}</p>
        </div>

        {/* Verified Skills */}
        <div className="space-y-2">
          <span className="text-[10px] text-textMuted uppercase block">
            Verified Technical Competencies ({skills.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-[#0A0C13] border border-border text-textPrimary"
              >
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Critical Gaps & Roadmap Action */}
        <div className="space-y-2">
          <span className="text-[10px] text-textMuted uppercase block">
            Identified Gaps for {targetRole.title}
          </span>
          {gaps.length > 0 ? (
            <div className="space-y-1.5">
              {gaps.map((g) => (
                <div
                  key={g.skill_name}
                  className="p-2 rounded bg-[#0A0C13] border border-border flex justify-between items-center text-[11px]"
                >
                  <span className="text-textPrimary">{g.skill_name}</span>
                  <span className="text-accent font-bold">+{g.estimated_gain} pts impact</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-400">All core competencies for this role are satisfied!</p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#0A0C13] border border-border text-textSecondary hover:text-textPrimary"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-accent text-black font-semibold hover:bg-teal-300"
          >
            Print / Save PDF Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}
