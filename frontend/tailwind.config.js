/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
        },
        navy: {
          DEFAULT: "#0F172A",
          dark: "#0B1120",
          light: "#1E293B",
        },
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        textMain: "#0F172A",
        textSub: "#64748B",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#06B6D4",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        cardHover: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
        modal: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
      }
    },
  },
  plugins: [],
};
