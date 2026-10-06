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
        primary: {
          DEFAULT: "#5CC6BF",
          hover: "#4FB7B0",
          dark: "#3EA59E",
          light: "#E6F6F4",
          soft: "#F0FAF9",
        },
        // "blush" conserva el nombre por compatibilidad, pero ahora es PERLA.
        blush: {
          DEFAULT: "#F1EDE6",
          light: "#F7F4EE",
          soft: "#FBFAF7",
          border: "#E7E1D6",
        },
        perla: {
          DEFAULT: "#F1EDE6",
          light: "#F7F4EE",
          soft: "#FBFAF7",
          border: "#E7E1D6",
        },
        // "accent.rose" conserva el nombre, pero ahora es CELESTE oscuro.
        accent: {
          rose: "#3EA59E",
          roseLight: "#E6F6F4",
        },
        dark: {
          DEFAULT: "#1A1A1A",
          muted: "#6B6B6B",
          subtle: "#8E8E8E",
          bg: "#0E0E0E",
        },
        border: {
          DEFAULT: "#ECECEC",
          light: "#F3F3F3",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        script: ["var(--font-script)", "Alex Brush", "cursive"],
      },
      borderRadius: {
        card: "14px",
        img: "10px",
        btn: "9999px",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,0.03)",
        hover: "0 6px 20px rgba(0,0,0,0.06)",
        card: "0 1px 3px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
