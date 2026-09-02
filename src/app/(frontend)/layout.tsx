import type { Metadata, Viewport } from 'next'
import { Dancing_Script, Playfair_Display } from 'next/font/google'
import Nav from './components/Nav'
import BottomNav from './components/BottomNav'
import { getCurrentUser } from '@/lib/session'
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

// viewportFit: 'cover' lets the page draw under the iPhone notch/home-indicator
// area so env(safe-area-inset-*) below actually resolves to a real value
// instead of 0 — needed for the fixed bottom nav to clear the home indicator.
export const viewport: Viewport = {
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser()

  return (
    <html lang="en" className={`${script.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-cream text-plum">
        <Nav currentUser={currentUser} />
        <main className="min-h-screen pb-20 sm:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
