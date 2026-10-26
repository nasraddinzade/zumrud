import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          900: "#0B2A21",
          700: "#114C3A",
        },
        gold: {
          500: "#C9A227",
          300: "#E3C86A",
        },
        cream: {
          50: "#F8F5EF",
        },
        ink: {
          900: "#14201B",
          500: "#5C6B63",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-display)", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        card: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 32, 27, 0.04), 0 6px 20px rgba(20, 32, 27, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
