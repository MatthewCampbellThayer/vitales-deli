/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        deli: {
          // Dark olive green — matches Vitale's nav
          olive: '#1F2E12',
          'olive-light': '#2D4A1E',
          'olive-mid': '#3D6428',
          // Italian/American red
          red: '#8B1A1A',
          'red-dark': '#6B1212',
          // Cream background
          cream: '#FFF8E7',
          'cream-dark': '#F0E6C8',
          // Text
          brown: '#1A1209',
          tan: '#C4944A',
          // Flag colors
          'flag-green': '#006400',
          'flag-blue': '#002868',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      keyframes: {
        shrink: {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shrink: 'shrink linear forwards',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
