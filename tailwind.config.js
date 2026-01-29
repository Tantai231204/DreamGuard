/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4988c4',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bde8f5',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4988c4',
          600: '#3a73a8',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          DEFAULT: '#bde8f5',
          50: '#f8fdfe',
          100: '#e6f7fb',
          200: '#bde8f5',
          300: '#94d9ef',
          400: '#5cc5e5',
          500: '#3bb0d8',
          600: '#2d91b8',
          700: '#277596',
          800: '#265f79',
          900: '#244f65',
        },
      },
    },
  },
  plugins: [],
};