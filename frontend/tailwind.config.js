/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#1c120c', // Map text-white to dark brown text
        purewhite: '#ffffff', // Real white for high contrast text on dark buttons
        primary: {
          DEFAULT: '#6e3d1c', // Rich chocolate brown primary
          hover: '#452003',
          light: '#8c5630',
        },
        accent: {
          DEFAULT: '#8c6f56', // Accent brown
          hover: '#735841',
          light: '#a68d76',
        },
        background: {
          DEFAULT: '#faf6f0', // Light sepia/brown background
          card: '#f1e6d7', // Soft sepia card background
          border: '#dfcbb5', // Soft warm brown border
          text: '#1c120c', // Dark brown text
          muted: '#70573e', // Muted brown text
        },
        slate: {
          50: '#0f0804',
          100: '#1c120c',
          200: '#22120a',
          300: '#2d1a10',
          400: '#4d3828',
          500: '#6b5443',
          600: '#8a7562',
          700: '#c0b29d',
          800: '#ded5c5',
          900: '#e8e2d5',
          950: '#f5f2eb',
        },
        red: {
          400: '#d32f2f', // Bright crimson red text for errors
          500: '#b71c1c', // Red dot indicator
          600: '#b71c1c', // Red background indicator
          950: '#fef2f2', // Soft red background card
        },
        orange: {
          400: '#c2410c',
          500: '#9a3412',
        },
        yellow: {
          400: '#854d0e',
          500: '#713f12',
          950: '#fefce8',
        },
        emerald: {
          400: '#059669',
          500: '#047857',
          950: '#ecfdf5',
        },
        blue: {
          400: '#1d4ed8',
          500: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
