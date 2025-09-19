/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* -----------------------------------------------------------------
           Brand palette: primary (bright red) & secondary (indigo)
        -----------------------------------------------------------------*/
        primary: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // brand primary (brighter red)
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        secondary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Custom colors for timeline nodes
        timeline: {
          node: '#4f46e5',       // secondary-600 (indigo)
          line: '#374151',       // gray-700 for dark theme
          nodeActive: '#4338ca', // secondary-700
          nodePulse: '#a5b4fc',  // secondary-300
        },

        /* -----------------------------------------------------------------
           Globally remap all Tailwind `cyan-*` utility classes to blue so
           existing class names immediately adopt the patriotic palette.
        -----------------------------------------------------------------*/
        cyan: colors.blue,
      },
      animation: {
        'typing': 'typing 1.2s steps(3) infinite',
      },
      keyframes: {
        typing: {
          '0%, 100%': { content: '"."' },
          '33%': { content: '".."' },
          '66%': { content: '"..."' },
        },
        /* -----------------------------------------------------------------
           Floating cloud + light-ray keyframes (used for spiritual bg)
        -----------------------------------------------------------------*/
        float: {
          '0%':   { transform: 'translateY(0) translateX(0)' },
          '50%':  { transform: 'translateY(-12px) translateX(4px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
        'float-delayed': {
          '0%':   { transform: 'translateY(0) translateX(0)' },
          '50%':  { transform: 'translateY(-16px) translateX(-6px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
        'float-slow': {
          '0%':   { transform: 'translateY(0) translateX(0)' },
          '50%':  { transform: 'translateY(-8px) translateX(2px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
        'ray-pulse': {
          '0%,100%': { opacity: '.25' },
          '50%':     { opacity: '.4'  },
        },
      },
      // Animation delay utilities for typing indicators
      animationDelay: {
        100: '100ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
        500: '500ms',
      },
      /* -----------------------------------------------------------------
         Register the keyframes as named animations
      -----------------------------------------------------------------*/
      animation: {
        'typing': 'typing 1.2s steps(3) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 7s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'ray-pulse': 'ray-pulse 5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // Tailwind v3+ has line-clamp utilities built-in. External plugin no longer required.
    // Plugin to generate animation-delay utilities
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animation-delay': (value) => {
            return {
              'animation-delay': value,
            };
          },
        },
        {
          values: theme('animationDelay'),
        }
      );
    },
  ],
}
