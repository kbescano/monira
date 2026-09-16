import { cookies } from 'next/headers'
import { AUTH_COOKIE, GUEST_PASSWORD, GUEST_USERNAME, todaysPassword, type Person } from './dailyPassword'

/** Reads the logged-in person (Ken/Nira) from the auth cookie, server-side.
 * Returns null for the guest account too — guest isn't a Person, so this
 * naturally keeps it out of uploads/hearts/notifications/etc. everywhere
 * this is already used for that. Use isGuestSession() to specifically
 * detect guest instead. */
export async function getCurrentUser(): Promise<Person | null> {
  const store = await cookies()
  const raw = store.get(AUTH_COOKIE)?.value
  if (!raw) return null

  const [person, password] = raw.split(':')
  if (password !== todaysPassword()) return null
  if (person !== 'Ken' && person !== 'Nira') return null
  return person
}

/** True only for the guest account (fixed username/password, not the
 * daily-rotating one) — used to block Letters and View Once at the page
 * level. */
export async function isGuestSession(): Promise<boolean> {
  const store = await cookies()
  const raw = store.get(AUTH_COOKIE)?.value
  if (!raw) return false

  const [person, password] = raw.split(':')
  return person === GUEST_USERNAME && password === GUEST_PASSWORD
}
