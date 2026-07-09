/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: '#001f3f',
        gold: '#FFD700',
        oro: '#D4AF37',
        marfil: '#FFFFF0',
        cream: '#F5F5DC',
        'accent-red': '#C41E3A',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.3px' }],
        sm: ['0.95rem', { lineHeight: '1.5', letterSpacing: '0.2px' }],
        base: ['1rem', { lineHeight: '1.6', letterSpacing: '0.3px' }],
        lg: ['1.125rem', { lineHeight: '1.7', letterSpacing: '0.2px' }],
        xl: ['1.25rem', { lineHeight: '1.8', letterSpacing: '0px' }],
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.2px' }],
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.3px' }],
        '4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.5px' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '7.5': '1.875rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 31, 63, 0.05)',
        md: '0 4px 6px -1px rgba(0, 31, 63, 0.1), 0 2px 4px -1px rgba(0, 31, 63, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 31, 63, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 31, 63, 0.1)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
