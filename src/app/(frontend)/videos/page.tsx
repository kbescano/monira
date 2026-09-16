import type { Where } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser, isGuestSession } from '@/lib/session'
import type { Person } from '@/lib/dailyPassword'
import UploadVideo from '../components/UploadVideo'
import DeviceGate from '../components/DeviceGate'
import GuestRestrictedNotice from '../components/GuestRestrictedNotice'
import VideoListItem from './VideoListItem'

export const dynamic = 'force-dynamic'

type PendingVideo = {
  id: string
  caption: string | null
  uploadedBy: string | null
  kind: 'video' | 'photo' | 'voice'
  canSave: boolean
  savedByMe: boolean
}

async function getPendingVideos(
  currentUser: Person | null,
): Promise<{ videos: PendingVideo[]; failed: boolean }> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'settings' }).catch(() => null)

    // "Show saved" only ever affects Ken — Nira's `savedBy` branch below
    // never matches anything anyway, since only Ken can save one. Off just
    // hides his saved stash from this list; nothing gets un-saved, and the
    // items themselves are still reachable directly if he already has the link.
    const showSavedToKen = settings?.showSaved !== false
    const where: Where =
      currentUser === 'Ken' && !showSavedToKen
        ? { savedBy: { exists: false } }
        : { or: [{ savedBy: { exists: false } }, { savedBy: { equals: currentUser } }] }

    const { docs } = await payload.find({
      collection: 'videos',
      where,
      sort: '-createdAt',
      limit: 100,
    })

    return {
      videos: docs.map((doc) => ({
        id: String(doc.id),
        caption: (doc.caption as string | undefined) || null,
        uploadedBy: (doc.uploadedBy as string | undefined) || null,
        kind: doc.kind === 'photo' ? 'photo' : doc.kind === 'voice' ? 'voice' : 'video',
        canSave: currentUser === 'Ken' && !doc.savedBy,
        savedByMe: Boolean(currentUser) && doc.savedBy === currentUser,
      })),
      failed: false,
    }
  } catch (error) {
    console.error('Failed to load videos from Payload:', error)
    return { videos: [], failed: true }
  }
}

export default async function VideosPage() {
  if (await isGuestSession()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blush via-cream to-cream">
        <GuestRestrictedNotice section="View Once" />
      </div>
    )
  }

  const currentUser = await getCurrentUser()
  const { videos, failed } = await getPendingVideos(currentUser)

  return (
    <DeviceGate>
      <div className="min-h-screen bg-gradient-to-b from-blush via-cream to-cream">

        {videos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
            <span className="text-4xl">{failed ? '🔌' : '🎬'}</span>
            <h2 className="font-serif text-xl text-berry">
              {failed ? "Couldn't load videos" : 'Nothing here right now'}
            </h2>
            <p className="max-w-sm text-sm text-plum/60">
              {failed
                ? 'The database might not be configured yet — double-check DATABASE_URI in your .env (see README).'
                : 'Tap the + to send a photo or video.'}
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col gap-3 px-4 pb-28 pt-2 sm:px-6">
            {videos.map((video) => (
              <VideoListItem
                key={video.id}
                id={video.id}
                caption={video.caption}
                mine={Boolean(currentUser && video.uploadedBy === currentUser)}
                kind={video.kind}
                canSave={video.canSave}
                savedByMe={video.savedByMe}
              />
            ))}
          </div>
        )}

        <UploadVideo currentUser={currentUser} />
      </div>
    </DeviceGate>
  )
}
