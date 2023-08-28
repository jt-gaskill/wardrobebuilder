/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", ],
  theme: {
    extend: {
      width: {
        '1/8': '12.5%',
        '7/8': '87.5%'
      }
    },
  },
  plugins: [],
}

