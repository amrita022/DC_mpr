/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: '#f84464',
        dark: {
          DEFAULT: '#0f0f0f',
          card: '#1a1a1a',
          border: '#2a2a2a',
          secondary: '#141414',
        },
      },
      borderRadius: {
        card: '8px',
        btn: '4px',
      },
    },
  },
  plugins: [],
}
