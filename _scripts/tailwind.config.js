/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_layouts/**/*.html",
    "./_posts/**/*.md",
    "./*.md",
    "./*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
        }
      },
      backgroundImage: {
        'itch-pattern': "url('https://img.itch.zone/aW1hZ2UyL3VzZXIvNjYzMDAvMzg3OTczLnBuZw==/original/2MHabA.png')",
      }
    },
  },
  plugins: [],
}
