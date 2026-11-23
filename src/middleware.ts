import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE, GUEST_PASSWORD, GUEST_USERNAME, todaysPassword } from '@/lib/dailyPassword'

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value
  const [person, password] = (cookie ?? '').split(':')

  const validPersonAuth = password === todaysPassword()
  const validGuestAuth = person === GUEST_USERNAME && password === GUEST_PASSWORD

  if (validPersonAuth || validGuestAuth) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', req.url)
  // Only ever redirect back to a same-site relative path — never trust an
  // absolute/protocol-relative URL here.
  const next = req.nextUrl.pathname + req.nextUrl.search
  if (next.startsWith('/') && !next.startsWith('//')) {
    loginUrl.searchParams.set('next', next)
  }
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Everything except: Payload's admin panel + its API (has its own login),
  // Next's static assets, the login page/action themselves, and the favicon /
  // link-preview images (link-preview crawlers and browser tabs fetch those
  // without being logged in).
  matcher: [
    '/((?!admin|api|_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|og.jpg|login).*)',
  ],
}
