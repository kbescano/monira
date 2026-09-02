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

export const SITE_USERNAME = 'keiraforevs'
export const AUTH_COOKIE = 'site_auth'
