/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        omidesk: {
          navy: '#0f172a',
          bg: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
}
