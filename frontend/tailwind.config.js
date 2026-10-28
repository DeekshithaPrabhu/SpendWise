/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        // Theme-aware colors: values live in src/styles.css (:root and .dark)
        apple: {
          blue: 'rgb(var(--apple-blue) / <alpha-value>)',
          blueHover: 'rgb(var(--apple-blue-hover) / <alpha-value>)',
          gray: 'rgb(var(--apple-bg) / <alpha-value>)',
          text: 'rgb(var(--apple-text) / <alpha-value>)',
          muted: 'rgb(var(--apple-muted) / <alpha-value>)',
          border: 'rgb(var(--apple-border) / <alpha-value>)',
          red: '#ff3b30',
        },
        surface: 'rgb(var(--apple-surface) / <alpha-value>)',
        fill: 'rgb(var(--apple-fill) / <alpha-value>)',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        lift: '0 8px 30px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
