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
        'barber-gold': '#499BED',      // Яркий средний синий - для акцентов и hover
        'barber-olive': '#022E5B',     // Глубокий темно-синий - для кнопок и основных элементов
        'barber-dark': '#031725',      // Очень темный синий - для фонов и заголовков
        'barber-light': '#DAEAFF',     // Очень светлый бледно-синий - для светлых фонов
        'barber-accent': '#A1C6F6',    // Светлый пастельный синий - для дополнительных акцентов
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
