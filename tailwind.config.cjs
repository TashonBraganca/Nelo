/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      colors: {
        bg: {
          light: '#f5f7fb',
          dark: '#050816'
        },
        surface: {
          light: '#ffffff',
          dark: '#0f172a'
        },
        primary: {
          DEFAULT: '#4f46e5',
          soft: '#6366f1'
        },
        accent: {
          pink: '#ec4899',
          cyan: '#22d3ee'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15,23,42,0.12)',
        focus: '0 0 0 2px rgba(99,102,241,0.35)'
      },
      borderRadius: {
        xl: '1.25rem'
      },
      backgroundImage: {
        'app-gradient':
          'radial-gradient(circle at top, rgba(79,70,229,0.18), transparent 60%), radial-gradient(circle at bottom, rgba(14,165,233,0.12), transparent 55%)'
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        'slide-down': {
          '0%': { opacity: 0, transform: 'translateY(-8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'blob': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(12px,-6px,0) scale(1.04)' },
          '66%': { transform: 'translate3d(-8px,10px,0) scale(0.98)' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 280ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        'scale-in': 'scale-in 220ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        'slide-down': 'slide-down 200ms ease-out',
        blob: 'blob 14s infinite ease-in-out'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
};