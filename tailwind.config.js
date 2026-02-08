import withMT from "@material-tailwind/react/utils/withMT";

/** @type {import('tailwindcss').Config} */
export default withMT({
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Новая цветовая палитра Xatna Markazi
        'doctor-gold': '#499BED',      // Яркий средний синий - для акцентов и hover
        'doctor-olive': '#022E5B',     // Глубокий темно-синий - для кнопок и основных элементов
        'doctor-dark': '#031725',      // Очень темный синий - для фонов и заголовков
        'doctor-light': '#DAEAFF',     // Очень светлый бледно-синий - для светлых фонов
        'doctor-accent': '#A1C6F6',    // Светлый пастельный синий - для дополнительных акцентов
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
})
