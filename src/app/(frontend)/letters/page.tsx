import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import { otherPerson } from '@/lib/dailyPassword'
import WriteLoveLetter from '../components/WriteLoveLetter'
import { lettersPage } from '../content'

export const dynamic = 'force-dynamic'

type Letter = {
  id: string
  to: string
  message: string
  createdAt: string
  pinned: boolean
}

async function getLetters(): Promise<{ letters: Letter[]; failed: boolean }> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'love-letters',
      // Pinned letters float to the top, newest-first within each group.
      sort: '-pinned,-createdAt',
      limit: 200,
    })

    const letters = docs.map((doc) => ({
      id: String(doc.id),
      to: doc.to as string,
      message: doc.message as string,
      createdAt: doc.createdAt as string,
      pinned: Boolean(doc.pinned),
    }))

    return { letters, failed: false }
  } catch (error) {
    console.error('Failed to load letters from Payload:', error)
    return { letters: [], failed: true }
  }
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export default async function LettersPage() {
  const [{ letters, failed }, currentUser] = await Promise.all([getLetters(), getCurrentUser()])
  const defaultTo = currentUser ? otherPerson(currentUser) : 'Nira'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blush via-cream to-cream">
      <div className="px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14">
        <span className="text-xs font-medium uppercase tracking-widest text-rose">
          {letters.length > 0 ? `${letters.length} letters, kept` : 'The archive'}
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
            <article
              key={letter.id}
              className={`rounded-3xl border px-6 py-6 shadow-sm sm:px-8 sm:py-8 ${
                letter.pinned
                  ? 'border-rose/30 bg-white shadow-rose/10'
                  : 'border-rose/15 bg-white/70 shadow-rose/5'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose">
                  {letter.pinned && <span aria-label="Pinned">📌</span>}
                  To {letter.to}
                </span>
                <span className="text-xs text-plum/40">{formatDate(letter.createdAt)}</span>
              </div>
              <p className="whitespace-pre-line font-serif text-[17px] leading-relaxed text-plum/85">
                {letter.message}
              </p>
            </article>
          ))}
        </div>
      )}

      <WriteLoveLetter currentUser={currentUser} defaultTo={defaultTo} />
    </div>
  )
}
