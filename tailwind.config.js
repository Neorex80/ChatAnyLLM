/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--color-text-primary)',
            a: {
              color: 'var(--color-primary)',
              '&:hover': {
                color: 'var(--color-primary-dark)',
              },
            },
            h1: {
              color: 'var(--color-text-primary)',
            },
            h2: {
              color: 'var(--color-text-primary)',
            },
            h3: {
              color: 'var(--color-text-primary)',
            },
            strong: {
              color: 'var(--color-text-primary)',
            },
            code: {
              color: 'var(--color-text-primary)',
            },
            blockquote: {
              color: 'var(--color-text-secondary)',
              borderLeftColor: 'var(--color-border)',
            },
          },
        },
      },
    },
  },
  plugins: [],
};