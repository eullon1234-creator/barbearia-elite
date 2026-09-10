/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#080808',
          900: '#0E0E0E',
          850: '#141414',
          800: '#1A1A1A',
          700: '#262626',
          600: '#333333',
        },
        gold: {
          300: '#F5E396',
          400: '#E5C460',
          500: '#D4AF37', // Dourado metálico principal
          600: '#B89324',
          700: '#8C6F16',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F9E79F 0%, #D4AF37 50%, #B8860B 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #FFF0B3 0%, #E5C460 50%, #C59B27 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(26,26,26,0.95) 0%, rgba(14,14,14,0.98) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px -4px rgba(212, 175, 55, 0.4)',
        'gold-glow-sm': '0 0 14px -2px rgba(212, 175, 55, 0.3)',
      }
    },
  },
  plugins: [],
}
