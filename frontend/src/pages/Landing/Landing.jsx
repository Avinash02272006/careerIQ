import { useNavigate } from "react-router-dom";
import HeroBackgroundCanvas from "../../components/canvas/HeroBackgroundCanvas";

export default function Landing() {
  const navigate = useNavigate();

  const coreModules = [
    {
      step: "01",
      title: "Diagnostics Dashboard",
      path: "/dashboard",
      badge: "Real-time Telemetry",
      description:
        "Comprehensive skill radar charts, placement readiness score, market demand benchmarks, and personalized step-by-step career roadmaps.",
      actionLabel: "Open Dashboard →",
    },
    {
      step: "02",
      title: "ATS Resume Analyzer",
      path: "/resume-analyzer",
      badge: "OCR & Parser Engine",
      description:
        "Multi-engine text extraction for native PDFs, scanned document images, Word .docx, and plain text with deep ATS score breakdowns and keyword auditing.",
      actionLabel: "Analyze Resume →",
    },
    {
      step: "03",
      title: "AI Mock Interview Lab",
      path: "/interview",
      badge: "Interactive Practice",
      description:
        "Simulate high-stakes technical, system design, and behavioral interviews tailored to your target role with instant scoring, rubric feedback, and model answers.",
      actionLabel: "Start Interview →",
    },
    {
      step: "04",
      title: "Job Matching Engine",
      path: "/job-matching",
      badge: "Skill Compatibility",
      description:
        "Benchmark your verified skills against top tech openings, review match percentages, highlight missing skills, and run instant custom JD vs Resume scans.",
      actionLabel: "Explore Matches →",
    },
    {
      step: "05",
      title: "Admin Command Center",
      path: "/admin",
      badge: "Platform Operations",
      description:
        "Centralized administrative oversight with candidate registries, benchmark weights manager, system telemetry, 7-day throughput graphs, and health audits.",
      actionLabel: "Admin Console →",
    },
    {
      step: "06",
      title: "What-If & 3D Constellation",
      path: "/simulator",
      badge: "Predictive Modeling",
      description:
        "Forecast hiring score lifts before learning new technologies in the What-If Lab and explore interconnected skills in an interactive Three.js 3D space.",
      actionLabel: "Explore Lab →",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#08090C] text-neutral-200 overflow-hidden font-mono">
      {/* Background canvas */}
      <HeroBackgroundCanvas />

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
          <span>Universal Career Intelligence & Diagnostic Engine • v2.5</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-white leading-tight">
          Single Unified Platform for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#2DD4BF]">
            Career Placement & Skill Intelligence
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed font-sans">
          From multi-engine resume OCR parsing and diagnostic radar scoring, to real-time AI mock
          interviews, skill-driven job matching, and centralized administrative telemetry — all
          integrated seamlessly in one unified platform.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <button
            onClick={() => navigate("/resume-analyzer")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Analyze Resume (ATS Scanner) →
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Diagnostics Dashboard
          </button>
          <button
            onClick={() => navigate("/interview")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] hover:bg-[#2DD4BF]/20 transition-colors"
          >
            AI Mock Interview
          </button>
        </div>
      </section>

      {/* CORE SIX INTEGRATED MODULES GRID */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24 border-t border-white/[0.06] pt-14 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]">
            Complete Unified Architecture
          </span>
          <h2 className="text-2xl font-semibold text-white font-sans">
            Every Feature Integrated as One Single Application
          </h2>
          <p className="text-xs text-neutral-400 font-sans max-w-lg mx-auto">
            Switch effortlessly between resume analysis, diagnostic dashboards, interview simulations,
            job matching, and admin controls with shared real-time state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreModules.map((mod) => (
            <div
              key={mod.title}
              onClick={() => navigate(mod.path)}
              className="group cursor-pointer p-6 rounded-2xl bg-[#0B0D13] border border-white/[0.08] hover:border-[#2DD4BF]/50 transition-all space-y-4 shadow-xl hover:-translate-y-1 duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
                    {mod.step} // Platform Core
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-neutral-300">
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white font-sans group-hover:text-[#2DD4BF] transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-[#2DD4BF] group-hover:underline">
                <span>{mod.actionLabel}</span>
                <span className="text-neutral-500 group-hover:text-white transition-colors">↗</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
