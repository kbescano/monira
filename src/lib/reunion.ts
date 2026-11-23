import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getPayloadClient } from './payload'
import type { Person } from './dailyPassword'

export type ReunionState = {
  /** When she said yes (ISO), or null while the question is still open. */
  acceptedAt: string | null
  /** The lookup itself broke — callers treat that as "don't lock anyone out". */
  failed: boolean
}

export const getReunionState = cache(async (): Promise<ReunionState> => {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'reunion-answers',
      where: { kind: { equals: 'yes' } },
      sort: 'createdAt',
      limit: 1,
      depth: 0,
    })
    return { acceptedAt: docs[0]?.createdAt ?? null, failed: false }
  } catch (error) {
    console.error('Failed to read the reunion answer:', error)
    return { acceptedAt: null, failed: true }
  }
})

/** True only for Nira, and only until she's said yes. */
export async function isReunionPending(user: Person | null): Promise<boolean> {
  if (user !== 'Nira') return false
  const state = await getReunionState()
  return !state.failed && state.acceptedAt === null
}

/** Pages other than the front page call this: until she says yes, they send her back to it. */
export async function requireReunionAnswered(user: Person | null): Promise<void> {
  if (await isReunionPending(user)) redirect('/')
}

/** How many "not yet" answers Nira has left — for Ken's front-page reminder. */
export async function countReunionReplies(): Promise<number> {
  try {
    const payload = await getPayloadClient()
    const { totalDocs } = await payload.count({
      collection: 'reunion-answers',
      where: { kind: { equals: 'not-yet' } },
    })
    return totalDocs
  } catch (error) {
    console.error('Failed to count reunion answers:', error)
    return 0
  }
}
