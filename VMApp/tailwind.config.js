/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /border-(orange|green|red|gray|blue|yellow)-(400|600)/,
    },
  ],
};
