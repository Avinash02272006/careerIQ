/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#090A0F",
        surface: "#11121A",
        surfaceHover: "#171924",
        card: "#0E1017",
        border: "#202330",
        borderSubtle: "rgba(255, 255, 255, 0.07)",
        accent: "#2DD4BF",       // refined mint teal
        accentEmerald: "#10B981",
        accentCyan: "#06B6D4",
        accentIndigo: "#6366F1",
        textPrimary: "#F1F3F9",
        textSecondary: "#8E94A8",
        textMuted: "#5D6377",
      },
      fontFamily: {
        display: ["Sora", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
