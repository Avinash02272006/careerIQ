import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { useCareerStore } from "../../lib/careerStore";

export default function Navbar({ onOpenCommandPalette, onOpenExportReport }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { hasAnalyzedResume, skills } = useCareerStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiClient
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const primaryNavLinks = [
    { name: "Overview", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Resume Analyzer", path: "/resume-analyzer" },
    { name: "Mock Interview", path: "/interview" },
    { name: "Job Matching", path: "/job-matching" },
    { name: "Admin", path: "/admin" },
  ];

  const secondaryNavLinks = [
    { name: "Role Matrix", path: "/roles" },
    { name: "What-If Lab", path: "/simulator" },
    { name: "3D Universe", path: "/universe" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#08090C]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-white group-hover:text-[#2DD4BF] transition-colors">
              CAREERIQ
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-400">
              v2.5
            </span>
          </Link>

          {/* Minimal Search Button */}
          <button
            onClick={() => onOpenCommandPalette(true)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] text-neutral-400 hover:text-white text-[11px] font-mono transition-colors"
          >
            <span>Search</span>
            <kbd className="px-1 text-[9px] text-[#2DD4BF] bg-white/[0.05] rounded border border-white/[0.08]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Center Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {primaryNavLinks.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/resume-analyzer" && location.pathname === "/upload") ||
              (item.path === "/job-matching" && location.pathname === "/jobs") ||
              (item.path === "/admin" && location.pathname === "/admin-dashboard") ||
              (item.path === "/interview" && location.pathname === "/mock-interview");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1.5 rounded text-xs transition-colors font-medium ${
                  isActive
                    ? "text-[#2DD4BF] bg-white/[0.06] border border-white/[0.08]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="px-2 py-1.5 rounded text-xs text-neutral-400 hover:text-white hover:bg-white/[0.02] flex items-center gap-1 font-medium transition-colors"
            >
              <span>Explore</span>
              <span className="text-[9px]">▾</span>
            </button>

            {moreMenuOpen && (
              <div
                onMouseLeave={() => setMoreMenuOpen(false)}
                className="absolute right-0 mt-1 w-44 rounded-xl bg-[#0C0E14] border border-white/[0.08] shadow-2xl p-1.5 space-y-0.5 z-50 font-mono text-xs"
              >
                {secondaryNavLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreMenuOpen(false)}
                    className={`block px-3 py-1.5 rounded-lg text-xs ${
                      location.pathname === item.path
                        ? "text-[#2DD4BF] bg-white/[0.06]"
                        : "text-neutral-300 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Status & Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hasAnalyzedResume ? "bg-[#2DD4BF] animate-pulse" : "bg-neutral-600"
              }`}
            />
            <span className="text-neutral-400">
              {hasAnalyzedResume ? `${skills.length} Skills Detected` : "No Resume"}
            </span>
          </div>

          <button
            onClick={onOpenExportReport}
            className="text-[11px] font-mono px-2.5 py-1 rounded text-neutral-400 hover:text-white border border-transparent hover:border-white/[0.08] transition-colors"
          >
            Export
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.06]">
              <span className="text-xs text-neutral-300 font-mono">
                {user.full_name || user.email.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-[11px] font-mono text-neutral-500 hover:text-rose-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/upload"
              className="text-[11px] font-mono font-semibold px-3 py-1.5 rounded bg-white text-black hover:bg-neutral-200 transition-colors"
            >
              Upload Resume →
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded text-neutral-400 hover:text-white bg-white/[0.03] border border-white/[0.08]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0A0C10] px-4 py-3 space-y-1">
          {[...primaryNavLinks, ...secondaryNavLinks].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-1.5 rounded text-xs ${
                location.pathname === item.path ? "text-[#2DD4BF] bg-white/[0.06]" : "text-neutral-400"
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center text-xs">
            <button onClick={onOpenExportReport} className="text-neutral-400 font-mono text-[11px]">
              Export Report
            </button>
            <Link
              to="/resume-analyzer"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2.5 py-1 rounded bg-white text-black font-mono text-[11px]"
            >
              Resume Analyzer
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
