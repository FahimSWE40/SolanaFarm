/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0C0A14',
        surface: '#1A1625',
        'surface-variant': '#241E33',
        primary: '#D8B9FF',
        'primary-dim': '#B388FF',
        'primary-container': '#5B3E99',
        secondary: '#00F5A0',
        tertiary: '#00E5FF',
        accent: '#FFD700',
        error: '#FFB4AB',
        muted: '#79747E',
        outline: '#4C4355',
        'outline-variant': '#332D3E',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
