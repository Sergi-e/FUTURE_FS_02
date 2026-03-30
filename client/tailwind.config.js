/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Electric violet + cyan neon — glass UI will lean on these later
        neon: {
          violet: "#a855f7",
          cyan: "#22d3ee",
          glow: "#c084fc",
        },
        surface: {
          deep: "#0a0a0f",
          glass: "rgba(255, 255, 255, 0.04)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        neon: "0 0 24px rgba(168, 85, 247, 0.35), 0 0 48px rgba(34, 211, 238, 0.12)",
      },
      backdropBlur: {
        panel: "16px",
      },
    },
  },
  plugins: [],
};
