/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#F4F8F5',
          100: '#E8F3EB',
          200: '#D2E7D8',
          300: '#A9D1B5',
          400: '#7BB58D',
          500: '#4A7C59',
          600: '#3A6346',
          700: '#2F5038',
          800: '#27412E',
          900: '#213727',
        },
        cream: {
          50: '#FCFBF9',
          100: '#FAF9F6',
          200: '#F3EFEA',
          300: '#E8E1D7',
        },
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        sage: {
          50: '#F3F6F4',
          100: '#E4EAE5',
          200: '#CBD6CD',
          500: '#6B8E73',
          700: '#4A6551',
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite alternate',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'rain-drop': 'rainDrop 1.2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sway: {
          '0%': { transform: 'rotate(-2deg)' },
          '100%': { transform: 'rotate(2deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.02)' },
        },
        rainDrop: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '50%': { opacity: 0.8 },
          '100%': { transform: 'translateY(280px)', opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
