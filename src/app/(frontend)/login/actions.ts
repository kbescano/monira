'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_COOKIE, SITE_USERNAME, todaysPassword } from '@/lib/dailyPassword'

export async function login(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()
  const next = String(formData.get('next') ?? '/')
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  if (username !== SITE_USERNAME || password !== todaysPassword()) {
    redirect(`/login?next=${encodeURIComponent(safeNext)}&error=1`)
  }

  const store = await cookies()
  store.set(AUTH_COOKIE, todaysPassword(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // The cookie itself can live a while — the password embedded inside it is
    // re-checked against *today's* password on every request in middleware,
    // so it stops working the moment the day rolls over regardless of this.
    maxAge: 60 * 60 * 24 * 14,
  })

  redirect(safeNext)
}

export async function logout() {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
  redirect('/login')
}
