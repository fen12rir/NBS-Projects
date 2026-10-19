import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nbs: {
          red: "#E4002B",
          darkred: "#8B0000",
          lightred: "#FFF1F2",
          accent: "#C10024",
          black: "#111111",
          gray: {
            50: "#F9FAFB",
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827",
          }
        },
        pos: {
          bg: "#0B192C",
          surface: "#1E3E62",
          header: "#000000",
          accent: "#000080",
          screen: "#F4F6F9",
          border: "#3B82F6",
          btn: "#2563EB",
          btnHover: "#1D4ED8",
          btnDisabled: "#9CA3AF",
          green: "#16A34A",
          amber: "#D97706",
          red: "#DC2626"
        }
      },
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Consolas", "Courier New", "monospace"]
      }
    },
  },
  plugins: [],
};
export default config;
