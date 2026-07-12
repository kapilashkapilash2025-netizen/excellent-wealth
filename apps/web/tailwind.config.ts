import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            950: '#050914',
            900: '#0a1226',
            800: '#111c38',
          },
          accent: '#3fd0ff', // neon-blue
          maroon: '#7a2338', // restrained maroon, used sparingly for emphasis only
          ink: '#e6ecf5',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
