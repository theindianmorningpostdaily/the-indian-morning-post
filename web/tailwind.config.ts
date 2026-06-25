import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#111111",
          soft: "#2b2b2b",
        },
        accent: {
          DEFAULT: "#b91c1c", // masthead red
          dark: "#ef4444",
        },
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
