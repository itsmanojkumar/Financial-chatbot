import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0f14",
          900: "#0f161d",
          800: "#162028",
          700: "#1e2a35",
          600: "#2a3a48",
        },
        mist: {
          100: "#eef2f6",
          200: "#d8e1ea",
          300: "#b8c5d3",
          400: "#8fa3b8",
        },
        gold: {
          400: "#e8c872",
          500: "#d4af5a",
          600: "#b8923f",
        },
        teal: {
          400: "#5eead4",
          500: "#2dd4bf",
        },
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(212, 175, 90, 0.25)",
        panel: "0 24px 80px -20px rgba(0, 0, 0, 0.55)",
      },
      animation: {
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [typography],
};
