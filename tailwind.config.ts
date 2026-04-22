import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "var(--green)",
          mid: "var(--green-mid)",
          light: "var(--green-light)",
          pale: "var(--green-pale)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          bg: "var(--amber-bg)",
        },
        orange: "var(--orange)",
        red: "var(--red)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink2)",
          3: "var(--ink3)",
          4: "var(--ink4)",
        },
        border: "var(--border)",
        surface: "var(--surface)",
        white: "var(--white)",
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "xl": "12px",
        "lg": "8px",
      },
    },
  },
  plugins: [],
};
export default config;
