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