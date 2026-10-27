/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        apple: {
          blue: '#0071e3',
          blueHover: '#0077ed',
          gray: '#f5f5f7',
          text: '#1d1d1f',
          muted: '#6e6e73',
          border: '#d2d2d7',
          red: '#ff3b30',
        },
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        lift: '0 8px 30px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
