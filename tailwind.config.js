/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media', // Enable dark mode support
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBackground: '#242424',
        lightBackground: '#f9f9f9',
        red: '#b83535'
      },
    },
  },
  plugins: [],
}

