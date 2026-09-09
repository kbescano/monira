'use server'

import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import { otherPerson, type Person } from '@/lib/dailyPassword'

/**
 * Lets either of you pin or unpin any letter — a bookmark for the "view
 * pinned" modal. Uses the Local API (bypasses the collection's admin-only
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

/**
 * Toggles the current user's heart on a specific letter or reply — a
 * per-message reaction, not a reply of its own. At most one heart per person
 * per message, same as tapping it again just removes yours. Notifies the
 * other person only when newly hearting (not when un-hearting).
 */
export async function toggleHeart(id: string): Promise<{ ok: boolean; heartedBy: string[] }> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { ok: false, heartedBy: [] }

  const payload = await getPayloadClient()
  try {
    const doc = await payload.findByID({ collection: 'love-letters', id })
    if (!doc) return { ok: false, heartedBy: [] }

    const current = Array.isArray(doc.heartedBy) ? (doc.heartedBy as Person[]) : []
    const alreadyHearted = current.includes(currentUser)
    const next: Person[] = alreadyHearted
      ? current.filter((p) => p !== currentUser)
      : [...current, currentUser]

    await payload.update({ collection: 'love-letters', id, data: { heartedBy: next } })

    if (!alreadyHearted) {
      const replyTo = doc.replyTo as { id: number | string } | number | string | null
      const rootId = replyTo ? (typeof replyTo === 'object' ? replyTo.id : replyTo) : id
      const isReply = Boolean(replyTo)
      try {
        await payload.create({
          collection: 'notifications',
          data: {
            message: `${currentUser} hearted your ${isReply ? 'reply' : 'letter'}`,
            forUser: otherPerson(currentUser),
            read: false,
            link: `/letters/${rootId}`,
          },
        })
      } catch {
        // A missed notification isn't worth failing the heart itself over.
      }
    }

    return { ok: true, heartedBy: next }
  } catch {
    return { ok: false, heartedBy: [] }
  }
}
