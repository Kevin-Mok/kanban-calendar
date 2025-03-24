const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    // ... existing content ...
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} 