import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060709] text-neutral-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-auto font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-xs tracking-wider">CAREERIQ</span>
            <span className="text-[10px] text-neutral-600">• Skill & ATS Diagnostic Engine</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            Automated OCR text extraction, skill radar charts, and predictive placement modeling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-neutral-400">
          <Link to="/" className="hover:text-white transition-colors">
            Landing
          </Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/resume-analyzer" className="hover:text-white transition-colors">
            Resume Analyzer
          </Link>
          <Link to="/interview" className="hover:text-white transition-colors">
            Interview Lab
          </Link>
          <Link to="/job-matching" className="hover:text-white transition-colors">
            Job Matching
          </Link>
          <Link to="/admin" className="hover:text-white transition-colors">
            Admin
          </Link>
          <Link to="/roles" className="hover:text-white transition-colors">
            Benchmarks
          </Link>
          <Link to="/simulator" className="hover:text-white transition-colors">
            What-If Lab
          </Link>
        </div>
      </div>
    </footer>
  );
}
