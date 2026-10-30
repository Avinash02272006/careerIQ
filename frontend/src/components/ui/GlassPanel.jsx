export default function GlassPanel({ children, className = "" }) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl2 ${className}`}
    >
      {children}
    </div>
  );
}
