/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
      },
      colors: {
        'accent-1': '#FAFAFA',
        'accent-2': '#EAEAEA',
        'accent-7': '#333',
        success: '#0070f3',
        cyan: '#79FFE1',
        primary: {
          50: "#FFF",
          100: "#FFB575",
          200: "#FFD0A0",
          300: "#ff914d",
          400: "#E67643",
          500: "#C95919",
        'deep-orange': '#F6734A',
        'yellow-orange': '#FDAC14'
        },
        // Backgrounds, borders, subtle accents
        secondary: {
          50: "#FFFFFF",
          100: "#29456E",
          200: "#537FA1",
          300: "#00163d",
          400: "#000E27",
          500: "#00061A",
        },
        // Backgrounds, borders, subtle accents
        neutral: {
          100: '#f5f5f5',
          200: '#FFF',
          300: '#e6e2d4',
        },
        accent: {
          // Success messages, notifications, progress indicators
          100: '#16704c',
          // Highlights, icons, creative sections
          200: '#5f3131',
          // Attention-grabbing elements, notifications, important highlights
          300: '#ef546b',
          400: "#d9cd9c",
          500: "#e6e2d4",
          gradient: "linear-gradient(to right, #F5F5F5, #E35134, #FF914D, #BE2C1B, #6F0A0D)",
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(246, 115, 74, 0.75), rgba(253, 172, 20, 0.75))'
      },
      spacing: {
        28: '7rem',
      },
      letterSpacing: {
        tighter: '-.04em',
      },
      lineHeight: {
        tight: 1.2,
      },
      fontSize: {
        '5xl': '2.5rem',
        '6xl': '2.75rem',
        '7xl': '4.5rem',
        '8xl': '6.25rem',
      },
      boxShadow: {
        small: '0 5px 10px rgba(0, 0, 0, 0.12)',
        medium: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      scale : {
        '101':"1.01",
      }
    },
  },
  plugins: [],
}
