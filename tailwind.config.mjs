/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        script: ['var(--font-script)', 'cursive'],
        serif: ['var(--font-serif)', 'serif'],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'var(--font-inter)',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        blush: '#ffe3ec',
        rose: '#ff6f91',
        berry: '#c9184a',
        plum: '#590d22',
        cream: '#fff8f0',
        lilac: '#efe4f7',
      },
      keyframes: {
        petalFall: {
          '0%': { transform: 'translate3d(0, -10vh, 0)', opacity: '0' },
          '8%': { opacity: '1' },
          '92%': { opacity: '1' },
          '100%': { transform: 'translate3d(0, 110vh, 0)', opacity: '0' },
        },
        petalSway: {
          '0%, 100%': { transform: 'translateX(-26px) rotate(-30deg)' },
          '50%': { transform: 'translateX(26px) rotate(40deg)' },
        },
        equalizer: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        pulseHeart: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        petalFall: 'petalFall linear infinite',
        petalSway: 'petalSway ease-in-out infinite',
        equalizer: 'equalizer 0.9s ease-in-out infinite',
        pulseHeart: 'pulseHeart 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
