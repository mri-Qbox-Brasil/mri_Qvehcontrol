/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dash-bg': '#111111',
        'dash-card': '#1a1a1a',
        'dash-accent': '#5bd029', // Custom Green
        'dash-sidebar': '#0a0a0a',
      }
    },
  },
  plugins: [],
}
