'use server'

import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'

/**
 * Lets either of you pin or unpin any letter — floats it to the top of the
 * feed for both. Uses the Local API (bypasses the collection's admin-only
 * `pinned` field access, same pattern as unsendVideo) since this is a
 * deliberate, narrow exception: anyone logged into the site can toggle it,
 * not just an admin.
 */
export async function togglePin(id: string, pinned: boolean): Promise<{ ok: boolean }> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { ok: false }

  const payload = await getPayloadClient()
  try {
    await payload.update({
      collection: 'love-letters',
      id,
      data: { pinned },
    })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
