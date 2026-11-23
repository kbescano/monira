import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Dancing_Script, Inter, Playfair_Display } from 'next/font/google'
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

// Fallback for the Apple-style display font (see `font-display` in the Tailwind
// config): devices with San Francisco use that, everyone else gets Inter.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const SITE_TITLE = 'Love Nira always'
const SITE_DESCRIPTION = 'A tiny corner of the internet, just for us.'

// Link previews (WhatsApp, Messenger, iMessage…) need absolute image URLs, so
// the base address is taken from the request itself — that way it's right on
// whatever domain the site is served from, with nothing to configure.
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')

  return {
    metadataBase: host ? new URL(`${proto}://${host}`) : undefined,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteName: SITE_TITLE,
      type: 'website',
      images: [{ url: '/og.jpg', width: 1200, height: 630, alt: SITE_TITLE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: ['/og.jpg'],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
  }
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
    <html lang="en" className={`${script.variable} ${serif.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream text-plum">
        <Nav currentUser={currentUser} />
        <main className="min-h-screen pb-20 sm:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
