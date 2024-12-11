/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dosgrados: {
          navy: '#1B3160',
          blue: '#3B82F6',
          gray: '#6B7280',
        }
      },
    },
  },
  plugins: [],
};