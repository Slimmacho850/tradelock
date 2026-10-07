/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a12',
          900: '#0b0f19',
          850: '#101625',
          800: '#161e31',
          700: '#222d47',
          600: '#324164'
        },
        trade: {
          green: '#10b981',
          greenLight: '#34d399',
          red: '#ef4444',
          redLight: '#f87171',
          gold: '#f59e0b',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
