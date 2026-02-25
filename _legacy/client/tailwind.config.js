/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      'light', // default DaisyUI light theme
      'cupcake', // a soft light theme
      'emerald', // another light theme
      'corporate', // clean light theme
      'synthwave', // for optional dark mode
    ],
  },
};
