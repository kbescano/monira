'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_COOKIE, USERS, todaysPassword } from '@/lib/dailyPassword'
import { getPayloadClient } from '@/lib/payload'

export async function login(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()
  const next = String(formData.get('next') ?? '/')
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  const person = USERS[username]
  if (!person || password !== todaysPassword()) {
    redirect(`/login?next=${encodeURIComponent(safeNext)}&error=1`)
  }

  const store = await cookies()
  store.set(AUTH_COOKIE, `${person}:${todaysPassword()}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // The cookie itself can live a while — the password embedded inside it is
    // re-checked against *today's* password on every request in middleware,
    // so it stops working the moment the day rolls over regardless of this.
    maxAge: 60 * 60 * 24 * 14,
  })

  // Ken likes knowing the moment Nira opens the site — one-way only, he
  // doesn't get a notification from his own logins.
  if (person === 'Nira') {
    try {
      const payload = await getPayloadClient()
      await payload.create({
        collection: 'notifications',
        data: { message: 'Nira just logged in', forUser: 'Ken', read: false, link: '/' },
      })
    } catch {
      // Fail soft — a missed notification shouldn't block Nira from getting in.
    }
  }

  redirect(safeNext)
}

export async function logout() {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
  redirect('/login')
}
