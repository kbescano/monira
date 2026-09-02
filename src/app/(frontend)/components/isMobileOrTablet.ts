// Client-only device check. Deliberately not done server-side via User-Agent:
// iPadOS Safari reports itself as plain desktop "Macintosh" by default, so a
// UA regex alone would wrongly block real iPads. Touch capability + platform
// is the reliable signal here — viewport width is NOT: a landscape iPad Pro
// can be 1024-1366px wide, the same range as small laptops, so gating on
// width was wrongly blocking real iPads. This must run client-side.
export function isMobileOrTablet(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false

  const ua = navigator.userAgent
  const hasTouch = navigator.maxTouchPoints > 1 || 'ontouchstart' in window
  const isAppleTouch = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && hasTouch)
  const isAndroid = /Android/i.test(ua)

  return isAppleTouch || isAndroid || hasTouch
}
