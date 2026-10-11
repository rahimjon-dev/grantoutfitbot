/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0c',
          800: '#121216',
          700: '#1a1a20',
          600: '#26262e'
        },
        gold: {
          400: '#dfb76c',
          500: '#c5a059',
          600: '#a38140'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'serif']
      }
    },
  },
  plugins: [],
}
