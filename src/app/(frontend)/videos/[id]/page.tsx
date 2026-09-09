import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import type { Person } from '@/lib/dailyPassword'
import WatchVideoClient from './WatchVideoClient'

export const dynamic = 'force-dynamic'

type SenderInfo = { exists: boolean; uploadedBy: Person | null; kind: 'video' | 'photo' | 'voice' }

// Looking this up only reveals *who sent it and what kind of message it is*
// (for the "Ken sent you a video/photo" heading before the tap) — it never
// touches the file itself, so it can't accidentally burn the once-only view.
async function videoSender(id: string, currentUser: Person | null): Promise<SenderInfo> {
  try {
    const payload = await getPayloadClient()
    const doc = await payload.findByID({ collection: 'videos', id })
    const uploadedBy = doc?.uploadedBy
    // A saved item only ever exists for whoever saved it — anyone else gets
    // the same "gone" state as if it had already been watched.
    const savedBy = doc?.savedBy
    const hidden = Boolean(savedBy) && savedBy !== currentUser
    return {
      exists: Boolean(doc) && !hidden,
      uploadedBy: uploadedBy === 'Ken' || uploadedBy === 'Nira' ? uploadedBy : null,
      kind: doc?.kind === 'photo' ? 'photo' : doc?.kind === 'voice' ? 'voice' : 'video',
    }
  } catch {
    return { exists: false, uploadedBy: null, kind: 'video' }
  }
}

export default async function WatchVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const currentUser = await getCurrentUser()
  const { exists, uploadedBy, kind } = await videoSender(id, currentUser)

  return (
    <WatchVideoClient id={id} exists={exists} uploadedBy={uploadedBy} currentUser={currentUser} kind={kind} />
  )
}
