/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        refinery: {
          bg: "#f8fafc",
          border: "#e2e8f0",
          card: "#ffffff",
          text: {
            primary: "#0f172a",
            secondary: "#475569",
            muted: "#64748b",
          },
          status: {
            safe: "#10b981",       // Green
            moderate: "#eab308",   // Yellow
            high: "#f97316",       // Orange
            critical: "#ef4444",   // Red
          }
        }
      },
      boxShadow: {
        refinery: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        refineryHover: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        refineryCard: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 8px -1px rgba(15, 23, 42, 0.03)"
      }
    },
  },
  plugins: [],
}
