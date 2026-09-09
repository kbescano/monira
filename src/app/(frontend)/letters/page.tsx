import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import { otherPerson } from '@/lib/dailyPassword'
import WriteLoveLetter from '../components/WriteLoveLetter'
import LetterCard from './LetterCard'
import PinnedLettersButton from './PinnedLettersButton'
import { lettersPage } from '../content'

export const dynamic = 'force-dynamic'

type Letter = {
  id: string
  to: string
  message: string | null
  voiceNoteUrl: string | null
  createdAt: string
  pinned: boolean
  replyCount: number
  heartedBy: string[]
}

async function getLetters(): Promise<{ letters: Letter[]; failed: boolean }> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)

    // "Show Letters" off doesn't delete anything — it just hides whatever
    // already existed at the moment it was turned off. Writing (or replying)
    // still works normally, and anything created after that cutoff shows up
    // same as always; turning it back on removes the cutoff entirely.
    const showLetters = settings?.showLetters !== false
    const hiddenAt = settings?.lettersHiddenAt

    const { docs } = await payload.find({
      collection: 'love-letters',
      // depth: 1 resolves voiceNote to its file (need the url) and replyTo to
      // its parent — fetched in one shot rather than a query per thread.
      depth: 1,
      sort: '-createdAt',
      limit: 500,
      where: showLetters ? undefined : { createdAt: { greater_than: hiddenAt || new Date().toISOString() } },
    })

    // Only top-level letters (no replyTo) show up on the feed — replies live
    // inside that letter's thread page instead. Reply counts still include
    // any old heart-replies from before hearting became a per-message
    // reaction — those rows still exist, just nothing new creates more of them.
    const replyCountByRoot = new Map<string, number>()
    for (const doc of docs) {
      const replyTo = doc.replyTo as { id: number | string } | number | string | null
      if (!replyTo) continue
      const rootId = String(typeof replyTo === 'object' ? replyTo.id : replyTo)
      replyCountByRoot.set(rootId, (replyCountByRoot.get(rootId) ?? 0) + 1)
    }

    // Newest-first, same as the query order — pinned letters no longer float
    // to the top here; pinning still works, it's just for the "view pinned"
    // modal now, not for reordering the main feed.
    const roots = docs.filter((doc) => !doc.replyTo)

    const letters = roots.map((doc) => {
      const voiceNote = doc.voiceNote as { url?: string | null } | number | null
      const id = String(doc.id)
      return {
        id,
        to: doc.to as string,
        message: (doc.message as string | undefined) || null,
        voiceNoteUrl: (voiceNote && typeof voiceNote === 'object' && voiceNote.url) || null,
        createdAt: doc.createdAt as string,
        pinned: Boolean(doc.pinned),
        replyCount: replyCountByRoot.get(id) ?? 0,
        heartedBy: Array.isArray(doc.heartedBy) ? (doc.heartedBy as string[]) : [],
      }
    })

    return { letters, failed: false }
  } catch (error) {
    console.error('Failed to load letters from Payload:', error)
    return { letters: [], failed: true }
  }
}

export default async function LettersPage() {
  const [{ letters, failed }, currentUser] = await Promise.all([getLetters(), getCurrentUser()])
  const defaultTo = currentUser ? otherPerson(currentUser) : 'Nira'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blush via-cream to-cream">
      <PinnedLettersButton letters={letters} />
      <div className="px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14">
        <span className="text-xs font-medium uppercase tracking-widest text-rose">
          {letters.length > 0 ? `${letters.length} threads, kept` : 'The archive'}
        </span>
        <h1 className="mt-2 font-script text-4xl text-berry sm:text-5xl">{lettersPage.title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-plum/70 sm:text-base">
          {lettersPage.subtitle}
        </p>
      </div>

      {letters.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
          <span className="text-4xl">{failed ? '🔌' : '💌'}</span>
          <h2 className="font-serif text-xl text-berry">
            {failed ? "Couldn't load letters" : lettersPage.emptyTitle}
          </h2>
          <p className="max-w-sm text-sm text-plum/60">
            {failed
              ? 'The database might not be configured yet — double-check DATABASE_URI in your .env (see README).'
              : lettersPage.emptySubtitle}
          </p>
        </div>
      ) : (
        <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 pb-28 pt-2 sm:px-6">
          {letters.map((letter) => (
            <LetterCard key={letter.id} letter={letter} currentUser={currentUser} />
          ))}
        </div>
      )}

      <WriteLoveLetter currentUser={currentUser} defaultTo={defaultTo} />
    </div>
  )
}
