/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        customBlue: "#0A66C2",
        customGreen: "#28A745",
        customRed: "#DC3545",
      },
    },
  },
  plugins: [],
};
