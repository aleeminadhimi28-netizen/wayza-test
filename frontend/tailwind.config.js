/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wayzza: {
          primary: "#0D2018",
          accent: "#189B84",
          bg: "#F8F9F8",
          dark: "#0D2018",
        }
      }
    },
  },
  plugins: [],
};