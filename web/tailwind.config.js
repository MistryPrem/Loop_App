/** @type {import('tailwindcss').Config} */
import { themes } from '../shared/dist/designTokens.js';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E'
        }
      },
      fontSize: {
        // Floor of 16px, default 18px body text
        xs: ['0.875rem', { lineHeight: '1.25rem' }],
        sm: ['1rem', { lineHeight: '1.5rem' }],
        base: ['1.125rem', { lineHeight: '1.75rem' }], // 18px standard body
        lg: ['1.25rem', { lineHeight: '1.75rem' }],
        xl: ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '4xl': ['3rem', { lineHeight: '1' }]
      },
      minHeight: {
        'touch': '3rem', // 48px standard touch target
        'checkin': '4rem' // 64px primary checkin button
      }
    }
  },
  plugins: []
};
