'use server'

import { getPayloadClient } from '@/lib/payload'
import { getReunionState } from '@/lib/reunion'
import { getCurrentUser } from '@/lib/session'

const MAX_MESSAGE = 1200

type Result = { ok: true } | { ok: false; error: string }

const FAILED: Result = { ok: false, error: 'Something went wrong. Please try again.' }

function excerpt(text: string, max = 90): string {
  const flat = text.replace(/\s+/g, ' ')
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat
}

// She said yes. Saved once (a second tap or tab changes nothing), and Ken is
// told straight away. Deliberately no revalidatePath here: that would swap the
// page out from under the celebration screen — the client refreshes itself
// when she taps through to the front page.
export async function acceptReunion(): Promise<Result> {
  if ((await getCurrentUser()) !== 'Nira') return FAILED

  try {
    const payload = await getPayloadClient()
    const { acceptedAt } = await getReunionState()
    if (acceptedAt) return { ok: true }

    await payload.create({ collection: 'reunion-answers', data: { kind: 'yes' } })
    await payload
      .create({
        collection: 'notifications',
        data: {
          message: 'Nira said yes — she wants us back. 💕',
          forUser: 'Ken',
          read: false,
          link: '/',
        },
      })
      .catch(() => {})
    return { ok: true }
  } catch (error) {
    console.error('Failed to save the reunion answer:', error)
    return FAILED
  }
}

// "Not yet" — optionally with why, or conditions she'd like to add. It's kept
// (so Ken can re-read it) and Ken gets a notification with the start of it.
// The client logs her out afterwards.
export async function declineReunion(message: string): Promise<Result> {
  if ((await getCurrentUser()) !== 'Nira') return FAILED

  const text = String(message ?? '')
    .trim()
    .slice(0, MAX_MESSAGE)

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'reunion-answers',
      data: { kind: 'not-yet', message: text || undefined },
    })
    await payload
      .create({
        collection: 'notifications',
        data: {
          message: text ? `Nira isn’t ready yet: “${excerpt(text)}”` : 'Nira isn’t ready yet.',
          forUser: 'Ken',
          read: false,
          link: '/pact',
        },
      })
      .catch(() => {})
    return { ok: true }
  } catch (error) {
    console.error('Failed to save the reunion answer:', error)
    return FAILED
  }
}
