/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Parchment — warm sage-green neutrals replacing Tailwind stone
        stone: {
          50:  '#F7F8F3',
          100: '#EEF1E6',
          200: '#E0E5D2',
          300: '#C7CFB2',
          400: '#9FA98A',
          500: '#6F7960',
          600: '#565E48',
          700: '#3F4534',
          800: '#2A2E22',
          900: '#181B12',
        },
        // Moss — olive-tinted greens replacing Tailwind forest
        forest: {
          50:  '#F1F4EC',
          100: '#E3E9D6',
          200: '#C7D2AE',
          300: '#A3B585',
          400: '#7A8F5C',
          500: '#5A7042',
          600: '#455934',
          700: '#364628',
          800: '#2A371F',
          900: '#1E2817',
        },
        // Clay — earthy warm-gold replacing Tailwind amber (pending / warning states)
        amber: {
          50:  '#FBF4E4',
          100: '#F4E5BF',
          200: '#E8CF8C',
          300: '#D9B95C',
          400: '#C8A035',
          500: '#A88527',
          600: '#8A6B1C',
          700: '#6F5715',
          800: '#564212',
          900: '#3D2F0E',
        },
      },
      fontFamily: {
        sans:    ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Bricolage Grotesque', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // Warm-cast shadows (brown tint, not pure black)
        card:        '0 1px 2px rgba(42,46,34,0.05), 0 1px 3px rgba(42,46,34,0.04)',
        'card-hover':'0 2px 4px rgba(42,46,34,0.06), 0 4px 8px rgba(42,46,34,0.05)',
        dropdown:    '0 4px 8px rgba(42,46,34,0.07), 0 8px 24px rgba(42,46,34,0.08)',
        glow:        '0 0 0 4px rgba(69,89,52,0.12)',
      },
      borderRadius: {
        xl:  '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
