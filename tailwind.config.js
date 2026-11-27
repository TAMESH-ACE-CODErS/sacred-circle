/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'Noto Sans', 'Arial', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        hindi: ['Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#fdfaf4',
          100: '#faf6ee',
          200: '#f2e9d8',
          300: '#e6d6b8',
          400: '#d4b98d',
          500: '#b9935f',
          600: '#96734a',
          700: '#77593c',
          800: '#5e4732',
          900: '#463426',
        },
        ink: {
          100: '#f4f1ea',
          200: '#dcd6c8',
          300: '#b9b0a0',
          400: '#8c8375',
          500: '#6b6357',
          600: '#4d463d',
          700: '#332e28',
          800: '#211d19',
          900: '#14110f',
        },
        night: {
          100: '#e8e3f5',
          200: '#c9c0e6',
          300: '#9b8fc9',
          400: '#7567a8',
          500: '#584b85',
          600: '#3f3563',
          700: '#2c2547',
          800: '#1d1832',
          900: '#120f22',
        },
        gold: {
          100: '#fff7df',
          200: '#f6e6b4',
          300: '#ebd083',
          400: '#dcb458',
          500: '#c79535',
          600: '#a47529',
        },
      },
      boxShadow: {
        calm: '0 14px 40px -20px rgba(42, 32, 20, 0.28)',
        glow: '0 0 0 1px rgba(220, 180, 88, 0.35), 0 18px 50px -24px rgba(220, 180, 88, 0.45)',
      },
    },
  },
  plugins: [],
}
