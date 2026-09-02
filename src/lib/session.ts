import { cookies } from 'next/headers'
import { AUTH_COOKIE, todaysPassword, type Person } from './dailyPassword'

/** Reads the logged-in person (Ken/Nira) from the auth cookie, server-side. */
export async function getCurrentUser(): Promise<Person | null> {
  const store = await cookies()
  const raw = store.get(AUTH_COOKIE)?.value
  if (!raw) return null

  const [person, password] = raw.split(':')
  if (password !== todaysPassword()) return null
  if (person !== 'Ken' && person !== 'Nira') return null
  return person
}
