import { getPayloadClient } from './payload'
import type { Person } from './dailyPassword'

export type ViewOnceGateStatus = {
  /** True only for Nira, and only while she still owes sends. */
  locked: boolean
  remaining: number
}

const REQUIRED_SENDS = 3

const UNLOCKED: ViewOnceGateStatus = { locked: false, remaining: 0 }

/**
 * Nira-only gate: while Site Settings has "Show reasons", "Show letters",
 * "Show memories", AND "Send View Once (gate)" all on, she has to send 3
 * View Once items (counted by Videos.ts's afterChange hook, since the docs
 * themselves mostly get deleted the moment they're watched) before those
 * three pages unlock. Ken is never affected — he doesn't call this at all,
 * but it also just returns unlocked for him as a safety net.
 */
export async function getViewOnceGateStatus(currentUser: Person | null): Promise<ViewOnceGateStatus> {
  if (currentUser !== 'Nira') return UNLOCKED

  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'settings' })

    const gateOn =
      settings.showReasons !== false &&
      settings.showLetters !== false &&
      settings.showMemories !== false &&
      Boolean(settings.requireViewOnceGate)
    if (!gateOn) return UNLOCKED

    const sent = settings.niraViewOnceSentCount ?? 0
    const remaining = Math.max(0, REQUIRED_SENDS - sent)
    return { locked: remaining > 0, remaining }
  } catch (error) {
    console.error('Failed to check the View Once gate:', error)
    return UNLOCKED
  }
}
