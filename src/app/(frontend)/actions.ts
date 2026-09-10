'use server'

import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'

const REASON_TAP_MESSAGE = 'Nira tapped the reason button'
const REASON_TAP_THROTTLE_MS = 5 * 60 * 1000 // 5 minutes

// Ken likes knowing when Nira taps the reason button — same one-way deal as
// the login notification, so nothing fires when he's the one tapping it.
// Throttled: one notification, then nothing more until 5+ minutes have
// passed, so mashing "give me another one" doesn't spam him. The check is
// against the Notifications collection itself rather than an in-memory
// timestamp — serverless invocations don't share memory, so that wouldn't
// survive between taps.
export async function notifyReasonTap(): Promise<void> {
  const currentUser = await getCurrentUser()
  if (currentUser !== 'Nira') return

  try {
    const payload = await getPayloadClient()

    const { docs: recent } = await payload.find({
      collection: 'notifications',
      where: { message: { equals: REASON_TAP_MESSAGE }, forUser: { equals: 'Ken' } },
      sort: '-createdAt',
      limit: 1,
    })
    const last = recent[0]
    if (last && Date.now() - new Date(last.createdAt as string).getTime() < REASON_TAP_THROTTLE_MS) {
      return
    }

    await payload.create({
      collection: 'notifications',
      data: { message: REASON_TAP_MESSAGE, forUser: 'Ken', read: false, link: '/' },
    })
  } catch {
    // Fail soft — a missed notification shouldn't break the reason generator.
  }
}
