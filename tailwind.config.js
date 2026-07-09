export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#001f3f',
        'navy-dark': '#000d1a',
        'gold': '#FFD700',
        'oro': '#D4AF37',
        'cream': '#F5F1E8',
        'marfil': '#FFFFF0',
        'accent-red': '#C41E3A',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
