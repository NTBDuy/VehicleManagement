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
      pattern: /(border|bg)-(orange|green|red|gray|emerald|amber|blue|yellow|slate)-(400|500|600)/,
    },
  ],
};
