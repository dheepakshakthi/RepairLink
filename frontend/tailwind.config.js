/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff', 100: '#dce7ff', 200: '#b9ceff', 300: '#8aadff',
          400: '#5483ff', 500: '#2b5fff', 600: '#1a46e8', 700: '#1535c0',
          800: '#162c96', 900: '#172a75', 950: '#111b4d',
        },
        surface: {
          0: '#ffffff', 50: '#f8f9fc', 100: '#f0f2f8', 200: '#e3e6f0',
          300: '#c9cedd', 400: '#9ba3bc', 500: '#6b7592', 600: '#4e5872',
          700: '#384155', 800: '#222938', 900: '#151b28', 950: '#0c1018',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
        display: ['"Sora"', '"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        card: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        lifted: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        brand: '0 4px 20px rgba(43,95,255,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
};

