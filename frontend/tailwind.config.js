/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
      }
    },
  },
  plugins: [],
}
