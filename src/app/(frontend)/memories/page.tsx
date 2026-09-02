import { getPayloadClient } from '@/lib/payload'
import MemoriesGallery, { type MemoryItem } from '../components/MemoriesGallery'
import { memoriesPage } from '../content'

export const dynamic = 'force-dynamic'

async function getMemories(): Promise<{ memories: MemoryItem[]; failed: boolean }> {
  try {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'memories',
      depth: 1,
      sort: '-memoryDate',
      limit: 200,
    })

    const memories = docs
      .map((doc) => {
        if (!doc.image || typeof doc.image !== 'object') return null
        const image = doc.image as {
          url?: string | null
          alt?: string | null
          width?: number | null
          height?: number | null
          cloudinary?: { secure_url?: string | null } | null
        }

        // payload-cloudinary uploads the file to Cloudinary but deliberately leaves
        // the core `url` field pointing at Payload's local-storage route, which
        // doesn't exist on a serverless host like Vercel. The real, working URL
        // lives under `cloudinary.secure_url` — prefer that, and only fall back to
        // `url` for a local dev setup that isn't using Cloudinary at all.
        const imageUrl = image.cloudinary?.secure_url || image.url
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
    </div>
  )
}
