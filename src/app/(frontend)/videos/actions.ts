'use server'

import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'

/**
 * Lets the sender delete their own not-yet-watched video before the other
 * person opens it — or lets whoever saved an item delete their own saved
 * copy (a saved item is otherwise permanent, so this is its only way out).
 */
export async function unsendVideo(id: string): Promise<{ ok: boolean }> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { ok: false }

  const payload = await getPayloadClient()
  try {
    const doc = await payload.findByID({ collection: 'videos', id })
    if (!doc) return { ok: false }
    const isSender = doc.uploadedBy === currentUser
    const isSaver = doc.savedBy === currentUser
    if (!isSender && !isSaver) return { ok: false }

    await payload.delete({ collection: 'videos', id })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

/**
 * Not a general feature — enforced here server-side, not just hidden in the
 * UI, so it can't be triggered any other way. Marks an item exempt from
 * burning and visible only to Ken from then on; the feed query and the
 * watch page both hide it from Nira once this is set.
 */
export async function saveVideo(id: string): Promise<{ ok: boolean }> {
  const currentUser = await getCurrentUser()
  if (currentUser !== 'Ken') return { ok: false }

  const payload = await getPayloadClient()
  try {
    await payload.update({ collection: 'videos', id, data: { savedBy: 'Ken' } })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
