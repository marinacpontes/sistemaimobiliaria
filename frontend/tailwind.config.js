/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#dde7ff',
          500: '#3b6ef0',
          600: '#2e58cc',
          700: '#2447a3',
        },
      },
    },
  },
  plugins: [],
};
