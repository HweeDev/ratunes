/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        dark: {
          base: '#0c0e12',
          card: '#14171f',
          surface: '#1b1f2b',
          border: '#2a3042',
          hover: '#222838',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-slower': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
