/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        body: ["'Noto Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        dmk: {
          red:    '#CC0000',
          darkred:'#990000',
          black:  '#111111',
          gold:   '#D4A017',
          cream:  '#FFF8E7',
        },
        surface: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        }
      },
      screens: {
        xs: '375px',
      },
      animation: {
        'fade-in':  'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft':'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from:{opacity:'0'}, to:{opacity:'1'} },
        slideUp: { from:{opacity:'0',transform:'translateY(12px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        slideIn: { from:{opacity:'0',transform:'translateX(-12px)'}, to:{opacity:'1',transform:'translateX(0)'} },
      },
    },
  },
  plugins: [],
}
