/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "slate" pasa a ser la paleta neutra cálida del diseño confirmado
        // (bg #F6F5F1, panel-2 #EFEDE6, line #E3E1D9, ink-mute/soft/ink).
        slate: {
          50: '#F6F5F1',
          100: '#EFEDE6',
          200: '#E3E1D9',
          300: '#D7D4C9',
          400: '#9B9E96',
          500: '#6B6F68',
          600: '#585C55',
          700: '#3F433D',
          800: '#1C201E',
        },
        // teal/indigo pasan a los acentos exactos del diseño (antes usaban
        // los valores por defecto de Tailwind).
        teal: {
          50: '#E1F1EC',
          600: '#0F6E56',
          700: '#0B5744',
          800: '#083D30',
        },
        indigo: {
          50: '#E6E9F7',
          700: '#3B4C9E',
        },
        rust: {
          50: '#F8E9E2',
          500: '#B5502E',
          600: '#B5502E',
          700: '#8B3D22',
        },
      },
      borderRadius: {
        lg: '9px',
        xl: '14px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}