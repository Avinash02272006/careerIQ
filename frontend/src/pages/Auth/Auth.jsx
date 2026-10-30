import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../lib/apiClient";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, full_name: fullName };

      const res = await apiClient.post(endpoint, payload);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Authentication error. Check email/password or server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("developer@example.com");
    setPassword("password123");
    if (mode === "signup") {
      setFullName("Alex Morgan");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full flex flex-col items-center">
      <div className="text-center mb-6 space-y-1.5">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#141722] border border-border flex items-center justify-center font-mono font-bold text-accent text-xs">
            IQ
          </div>
          <span className="font-display font-bold text-base text-textPrimary tracking-tight">
            CareerIQ Core
          </span>
        </Link>
        <h1 className="font-display font-bold text-2xl text-textPrimary">
          {mode === "login" ? "Developer Sign In" : "Register Career Profile"}
        </h1>
        <p className="text-xs text-textSecondary">
          {mode === "login"
            ? "Access your saved ATS diagnostics, roadmaps, and simulations."
            : "Evaluate your skills against React, Angular, Node, Express, and 3D stacks."}
        </p>
      </div>

      <div className="ui-card rounded-2xl p-6 sm:p-8 w-full border border-border space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="text-[11px] font-mono text-textSecondary uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#0C0E15] border border-border rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textMuted outline-none focus:border-accent font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-textSecondary uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="alex@developer.io"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0C0E15] border border-border rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textMuted outline-none focus:border-accent font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-textSecondary uppercase tracking-wider block mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0C0E15] border border-border rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textMuted outline-none focus:border-accent font-mono"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center text-[11px] font-mono pt-1 text-textMuted">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-accent hover:underline"
            >
              Fill Demo Credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-mono font-semibold text-xs bg-accent text-black hover:bg-teal-300 transition-all shadow-sm mt-1 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : mode === "login" ? "Sign In →" : "Create Profile →"}
          </button>
        </form>

        <div className="pt-4 border-t border-border text-center font-mono text-xs text-textSecondary">
          {mode === "login" ? "New to CareerIQ?" : "Already registered?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-accent hover:underline font-semibold"
          >
            {mode === "login" ? "Register here" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
