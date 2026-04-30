import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        primary: "var(--accent)",
        secondary: "var(--accent2)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)"
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;