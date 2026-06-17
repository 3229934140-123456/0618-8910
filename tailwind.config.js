/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '24px',
    },
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#d9e3ef',
          200: '#b3c7df',
          300: '#84a6c9',
          400: '#507eac',
          500: '#2f5e8f',
          600: '#234a74',
          700: '#1e3a5f',
          800: '#1a304e',
          900: '#162840',
          950: '#0e1a2a',
        },
        orange: {
          50: '#fff4ee',
          100: '#ffe6d6',
          200: '#ffc8a8',
          300: '#ffa374',
          400: '#ff7a45',
          500: '#ff5a1c',
          600: '#f03f0a',
          700: '#c72e08',
          800: '#9e2710',
          900: '#7f2311',
        },
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontVariantNumeric: {
        'tabular-nums': 'tabular-nums',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(30, 58, 95, 0.1), 0 8px 10px -6px rgba(30, 58, 95, 0.08)',
        'elevation-1': '0 4px 6px -1px rgba(30, 58, 95, 0.08), 0 2px 4px -2px rgba(30, 58, 95, 0.06)',
        'elevation-2': '0 10px 15px -3px rgba(30, 58, 95, 0.1), 0 4px 6px -4px rgba(30, 58, 95, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
