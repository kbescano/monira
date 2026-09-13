import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import { getViewOnceGateStatus } from '@/lib/viewOnceGate'
import MemoriesGallery, { type MemoryItem } from '../components/MemoriesGallery'
import UploadMemory from '../components/UploadMemory'
import ViewOnceGateNotice from '../components/ViewOnceGateNotice'
import { memoriesPage } from '../content'

export const dynamic = 'force-dynamic'

async function getMemories(): Promise<{ memories: MemoryItem[]; failed: boolean }> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)

    // "Show Memories" off doesn't delete anything — it just hides whatever
    // already existed at the moment it was turned off. Adding a memory still
    // works normally, and anything created after that cutoff shows up same
    // as always; turning it back on removes the cutoff entirely.
    const showMemories = settings?.showMemories !== false
    const hiddenAt = settings?.memoriesHiddenAt

    const { docs } = await payload.find({
      collection: 'memories',
      depth: 1,
      sort: '-memoryDate',
      limit: 200,
      where: showMemories
        ? undefined
        : { createdAt: { greater_than: hiddenAt || new Date().toISOString() } },
    })

    const memories = docs
      .map((doc) => {
        if (!doc.image || typeof doc.image !== 'object') return null
        const image = doc.image as {
          url?: string | null
          alt?: string | null
          width?: number | null
          height?: number | null
        }

        const imageUrl = image.url
        if (!imageUrl) return null

        return {
          id: String(doc.id),
          title: doc.title as string,
          description: doc.description as string,
          memoryDate: (doc.memoryDate as string | undefined) ?? null,
          imageUrl,
          imageAlt: image.alt || (doc.title as string),
          width: image.width ?? 1200,
          height: image.height ?? 1200,
        }
      })
      .filter((memory): memory is NonNullable<typeof memory> => memory !== null)

    return { memories, failed: false }
  } catch (error) {
    // Most likely cause locally: DATABASE_URI isn't set up yet (see README).
    // Fail soft with a friendly empty state instead of crashing the page.
    console.error('Failed to load memories from Payload:', error)
    return { memories: [], failed: true }
  }
}

export default async function MemoriesPage() {
  const currentUser = await getCurrentUser()
  const gate = await getViewOnceGateStatus(currentUser)

  if (gate.locked) {
    return (
      <div className="min-h-screen bg-cream">
        <ViewOnceGateNotice remaining={gate.remaining} />
      </div>
    )
  }

  const { memories, failed } = await getMemories()

  return (
    <div className="min-h-screen bg-cream">
      <div className="px-4 pb-4 pt-8 text-center sm:px-6">
        <h1 className="font-script text-4xl text-berry sm:text-5xl">{memoriesPage.title}</h1>
        <p className="mt-2 text-sm text-plum/70 sm:text-base">{memoriesPage.subtitle}</p>
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
          <span className="text-4xl">{failed ? '🔌' : '📷'}</span>
          <h2 className="font-serif text-xl text-berry">
            {failed ? "Couldn't load memories" : memoriesPage.emptyTitle}
          </h2>
          <p className="max-w-sm text-sm text-plum/60">
            {failed
              ? 'The database might not be configured yet — double-check DATABASE_URI in your .env (see README).'
              : memoriesPage.emptySubtitle}
          </p>
        </div>
      ) : (
        <MemoriesGallery memories={memories} />
      )}

      <UploadMemory currentUser={currentUser} />
    </div>
  )
}
