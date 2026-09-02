'use server'

import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'

/** Lets the sender delete their own not-yet-watched video before the other person opens it. */
export async function unsendVideo(id: string): Promise<{ ok: boolean }> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { ok: false }

  const payload = await getPayloadClient()
  try {
    const doc = await payload.findByID({ collection: 'videos', id })
    if (!doc) return { ok: false }
    if (doc.uploadedBy !== currentUser) return { ok: false }

    await payload.delete({ collection: 'videos', id })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
