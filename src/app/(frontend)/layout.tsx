import type { Metadata } from 'next'
import { Dancing_Script, Playfair_Display } from 'next/font/google'
import Nav from './components/Nav'
import './globals.css'

const script = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-script',
  weight: ['600', '700'],
})

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Love Nira always',
  description: 'A tiny corner of the internet, just for us.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-cream text-plum">
        <Nav />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
