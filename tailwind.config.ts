import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: {
    relative: true,
    files: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  },
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        navy: v("navy"),
        silver: v("silver"),
        racing: v("red"),
        charcoal: v("charcoal"),
        paper: "#F2F3F5",
        line: "#E3E6EA",
        whatsapp: "#1F8F4E",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-arabic)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "var(--font-arabic)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.32em",
      },
      keyframes: {
        scrollDot: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "70%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "0" },
        },
      },
      animation: {
        scrollDot: "scrollDot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
