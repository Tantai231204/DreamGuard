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
      animation: {
        "fade-in": "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fadeOut 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-right": "slideInFromRight 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-to-right": "slideOutToRight 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-out": "scaleOut 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        slideInFromRight: {
          "0%": { 
            transform: "translateX(100%)",
            opacity: "0"
          },
          "100%": { 
            transform: "translateX(0)",
            opacity: "1"
          },
        },
        slideOutToRight: {
          "0%": { 
            transform: "translateX(0)",
            opacity: "1"
          },
          "100%": { 
            transform: "translateX(100%)",
            opacity: "0"
          },
        },
        scaleIn: {
          "0%": { 
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": { 
            transform: "scale(1)",
            opacity: "1"
          },
        },
        scaleOut: {
          "0%": { 
            transform: "scale(1)",
            opacity: "1"
          },
          "100%": { 
            transform: "scale(0.95)",
            opacity: "0"
          },
        },
      },
    },
  },
  plugins: [],
};