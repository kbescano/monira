'use server'

import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'

type RevealResult = {
  url: string | null
  caption: string | null
  isSender?: boolean
  kind?: 'video' | 'photo'
}

/**
 * Looks the video up and hands back its URL — does NOT delete anything.
 * Deletion is a separate step (burnVideo, below), triggered by the client
 * only once the <video> has actually started playing. Deleting here instead
 * would destroy the Cloudinary asset before the browser had even fetched it,
 * turning the URL into a 404 the instant this function returns.
 */
export async function revealVideo(id: string): Promise<RevealResult> {
  try {
    const payload = await getPayloadClient()
    const currentUser = await getCurrentUser()
    const doc = await payload.findByID({ collection: 'videos', id })
    if (!doc) return { url: null, caption: null }

    const cloudinary = doc as { cloudinary?: { secure_url?: string | null } }
    const url = cloudinary.cloudinary?.secure_url || (doc.url as string | undefined) || null
    const caption = (doc.caption as string | undefined) || null
    const uploadedBy = doc.uploadedBy as string | undefined
    const kind = doc.kind === 'photo' ? 'photo' : 'video'

    if (!url) return { url: null, caption: null }

    const isSender = Boolean(uploadedBy && currentUser && uploadedBy === currentUser)
    return { url, caption, isSender, kind }
  } catch {
    return { url: null, caption: null }
  }
}

/**
 * The actual "view" — call once the video has genuinely started playing.
 * Deletes the doc + Cloudinary asset for good. A no-op for the sender
 * previewing their own (they don't get to burn it just by watching).
 */
export async function burnVideo(id: string): Promise<void> {
  try {
    const payload = await getPayloadClient()
    const currentUser = await getCurrentUser()
    const doc = await payload.findByID({ collection: 'videos', id })
    if (!doc) return

    const uploadedBy = doc.uploadedBy as string | undefined
    const isSender = Boolean(uploadedBy && currentUser && uploadedBy === currentUser)
    if (isSender) return

    await payload.delete({ collection: 'videos', id })
  } catch {
    // If this fails the video just stays around — worse than intended, but
    // far better than the alternative of deleting it before anyone watched.
  }
}
