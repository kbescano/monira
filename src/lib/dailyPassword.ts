// The site's password rotates every day at midnight Philippines time, formatted
// as MMDD (e.g. September 2nd -> "0902"). Uses Intl so it's correct regardless
// of which timezone the server itself runs in (Vercel runs UTC).
export function todaysPassword(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const month = parts.find((p) => p.type === 'month')?.value ?? '00'
  const day = parts.find((p) => p.type === 'day')?.value ?? '00'
  return `${month}${day}`
}

export type Person = 'Ken' | 'Nira'

// Usernames are intentionally swapped — each person logs in with the other's
// name. Both share the same rotating daily password.
export const USERS: Record<string, Person> = {
  loveniraforever: 'Ken',
  keiraforevs: 'Nira',
}

export function otherPerson(person: Person): Person {
  return person === 'Ken' ? 'Nira' : 'Ken'
}

export const AUTH_COOKIE = 'site_auth'

// A third, deliberately-not-a-Person account for anyone else who needs a
// peek at the site — fixed username/password (not the daily-rotating one),
// and not part of USERS above since it doesn't map to either Ken or Nira.
// Blocked from Letters and View Once at the page level (see
// GuestRestrictedNotice) — everything else on the site is open to it.
export const GUEST_USERNAME = 'guest'
export const GUEST_PASSWORD = 'guest'
