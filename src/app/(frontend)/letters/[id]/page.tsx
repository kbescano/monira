import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser, isGuestSession } from '@/lib/session'
import { otherPerson } from '@/lib/dailyPassword'
import GuestRestrictedNotice from '../../components/GuestRestrictedNotice'
import ThreadView, { type Bubble } from './ThreadView'

export const dynamic = 'force-dynamic'

function toBubble(doc: Record<string, unknown>): Bubble {
  const voiceNote = doc.voiceNote as { url?: string | null } | number | null
  return {
    id: String(doc.id),
    from: (doc.from as string | undefined) || null,
    message: (doc.message as string | undefined) || null,
    voiceNoteUrl: (voiceNote && typeof voiceNote === 'object' && voiceNote.url) || null,
    heart: Boolean(doc.heart),
    heartedBy: Array.isArray(doc.heartedBy) ? (doc.heartedBy as string[]) : [],
    createdAt: doc.createdAt as string,
  }
}

async function getThread(id: string): Promise<{ root: Bubble | null; replies: Bubble[]; to: string | null }> {
  try {
    const payload = await getPayloadClient()
    const root = await payload.findByID({ collection: 'love-letters', id, depth: 1 }).catch(() => null)
    if (!root || root.replyTo) {
      // Either it doesn't exist, or it's itself a reply — threads only open
      // at the root letter, so there's nothing to show.
      return { root: null, replies: [], to: null }
    }

    const { docs } = await payload.find({
      collection: 'love-letters',
      where: { replyTo: { equals: id } },
      sort: 'createdAt',
      depth: 1,
      limit: 500,
    })

    return {
      root: toBubble(root as unknown as Record<string, unknown>),
      replies: docs.map((doc) => toBubble(doc as unknown as Record<string, unknown>)),
      to: (root.to as string | undefined) || null,
    }
  } catch (error) {
    console.error('Failed to load thread from Payload:', error)
    return { root: null, replies: [], to: null }
  }
}

export default async function LetterThreadPage({ params }: { params: Promise<{ id: string }> }) {
  if (await isGuestSession()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blush via-cream to-cream">
        <GuestRestrictedNotice section="Letters" />
      </div>
    )
  }

  const { id } = await params
  const [{ root, replies, to }, currentUser] = await Promise.all([getThread(id), getCurrentUser()])

  // Whoever isn't logged in is who replies get addressed to — same rule the
  // compose modal uses for a brand-new letter.
  const defaultTo = currentUser ? otherPerson(currentUser) : (to as 'Ken' | 'Nira' | null) || 'Nira'

  return <ThreadView rootId={id} root={root} replies={replies} currentUser={currentUser} defaultTo={defaultTo} />
}
