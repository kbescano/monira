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
      },
      colors: {
        blush: '#ffe3ec',
        rose: '#ff6f91',
        berry: '#c9184a',
        plum: '#590d22',
        cream: '#fff8f0',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-110vh) rotate(20deg)', opacity: '0' },
        },
        pulseHeart: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        float: 'float linear forwards',
        pulseHeart: 'pulseHeart 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
