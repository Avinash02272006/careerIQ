export default function Button({ children, onClick, variant = "primary", className = "", ...props }) {
  const base = "px-6 py-3 rounded-xl2 font-body font-medium transition-all duration-200";
  const variants = {
    primary: "bg-accent text-base hover:opacity-90",
    ghost: "bg-transparent border border-border text-textPrimary hover:bg-surfaceHover",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
