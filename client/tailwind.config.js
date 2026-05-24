/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        los: {
          black: '#0a0a0a',
          dark: '#111111',
          card: '#1a1a1a',
          orange: '#ff6b00',
          'orange-light': '#ff8c33',
          'orange-glow': '#ff6b0040',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,107,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.03) 1px, transparent 1px)',
      },
      boxShadow: {
        glow: '0 0 30px rgba(255, 107, 0, 0.35)',
        'glow-sm': '0 0 15px rgba(255, 107, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
