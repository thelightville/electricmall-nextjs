import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#d60d06',   // Electric Mall red (from theme customizer)
          accent:  '#fed700',   // Electro theme yellow/gold
          dark:    '#181818',   // Very dark background
          gray:    '#333e48',   // Text gray
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(214, 13, 6, 0.15)',
        'brand-md': '0 4px 16px rgba(214, 13, 6, 0.25)',
        'brand-lg': '0 8px 32px rgba(214, 13, 6, 0.3)',
        'gold-sm': '0 2px 8px rgba(254, 215, 0, 0.2)',
        'gold-md': '0 4px 16px rgba(254, 215, 0, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
