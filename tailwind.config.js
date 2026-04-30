/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'signal-orange': '#FF5F1F',
      },
      borderWidth: {
        '4': '4px',
      }
    },
  },
  plugins: [],
}
