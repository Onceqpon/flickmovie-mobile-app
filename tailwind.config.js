/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#001D3D",
        secondary: "#A8B5DB",
        'main-bg': '#000C1C',
        'main-color': '#001d3d',
        'movie-card-bg': '#1b263b',
        'star-bg': '#ff7001',
        'seasons-bg': '#14233c',
      },
    },
  },
  plugins: [],
}