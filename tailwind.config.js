/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vata: { DEFAULT: "#3a64c8", light: "#e8eefa" },
        pitta: { DEFAULT: "#c2410c", light: "#fbe9e1" },
        kapha: { DEFAULT: "#0f7a5a", light: "#e2f2ec" },
      },
    },
  },
  plugins: [],
};
