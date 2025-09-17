/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0b1020',
          800: '#101937',
          700: '#111827',
        },
        /* Bot360AI primary palette */
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        /* Bot360AI secondary palette */
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        brand: {
          blue: '#1e3a8a',
          red: '#b91c1c',
          gold: '#d4af37',
        },
      },
      backgroundImage: {
        'flag-overlay': 'linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0.04)), url(/images/flag-texture.svg)',
      },
    },
  },
  plugins: [],
};