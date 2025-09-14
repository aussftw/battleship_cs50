/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        game: {
          'cell-empty': '#d1d5db',
          'cell-ship': '#93c5fd',
          'cell-hit': '#ef4444',
          'cell-miss': '#f3f4f6',
          'cell-hover': '#10b981',
          'cell-invalid': '#fca5a5',
          primary: '#3b82f6',
          'primary-hover': '#2563eb',
          danger: '#dc2626',
          'danger-hover': '#b91c1c',
        },
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.cell': {
          '@apply w-8 h-8 rounded border border-gray-400': {},
        },
        '.cell--empty': {
          'background-color': '#d1d5db',
        },
        '.cell--ship': {
          'background-color': '#93c5fd',
        },
        '.cell--hit': {
          'background-color': '#ef4444',
        },
        '.cell--miss': {
          'background-color': '#f3f4f6',
        },
        '.cell--hovered': {
          'background-color': 'rgba(16, 185, 129, 0.4)',
          'border-color': '#10b981',
          '@apply border-2 shadow-md transform scale-105 transition-transform duration-150':
            {},
        },
        '.cell--invalid-hover': {
          'background-color': '#fca5a5',
          'border-color': '#ef4444',
        },
        '.cell--small': {
          '@apply w-6 h-6': {},
        },
        '.board-grid': {
          '@apply bg-gray-100 rounded shadow-lg': {},
        },
        '.btn': {
          '@apply px-6 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2':
            {},
        },
        '.btn--primary': {
          'background-color': '#3b82f6',
          color: '#ffffff',
          '&:hover:not(:disabled)': {
            'background-color': '#2563eb',
          },
          '&:focus': {
            '@apply ring-blue-500': {},
          },
        },
        '.btn--danger': {
          'background-color': '#dc2626',
          color: '#ffffff',
          '&:hover:not(:disabled)': {
            'background-color': '#b91c1c',
          },
          '&:focus': {
            '@apply ring-red-500': {},
          },
        },
        '.btn:disabled': {
          '@apply opacity-50 cursor-not-allowed': {},
        },
        '.ship-selection': {
          '@apply flex flex-col items-center space-y-1 max-w-xs mx-auto mt-24 h-32':
            {},
        },
        '.ship-item': {
          '@apply flex items-center justify-start cursor-pointer p-1': {},
        },
        '.ship-item--selected': {
          'background-color': '#3b82f6',
          color: '#ffffff',
        },
        '.ship-item--unselected': {
          'background-color': '#ffffff',
        },
        '.ship-cells': {
          '@apply flex space-x-1': {},
        },
        '.ship-name': {
          '@apply ml-2': {},
        },
        '.game-boards': {
          '@apply flex justify-center items-center min-h-[50vh] flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-12 mt-12':
            {},
        },
        '.board-section': {
          '@apply flex flex-col items-center space-y-2': {},
        },
        '.board-title': {
          '@apply text-lg font-bold m-4': {},
        },
      });
    },
  ],
};
