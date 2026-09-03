import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import type { Person } from '@/lib/dailyPassword'
import WatchVideoClient from './WatchVideoClient'

export const dynamic = 'force-dynamic'

type SenderInfo = { exists: boolean; uploadedBy: Person | null; kind: 'video' | 'photo' }

// Looking this up only reveals *who sent it and what kind of message it is*
// (for the "Ken sent you a video/photo" heading before the tap) — it never
// touches the file itself, so it can't accidentally burn the once-only view.
async function videoSender(id: string): Promise<SenderInfo> {
  try {
    const payload = await getPayloadClient()
    const doc = await payload.findByID({ collection: 'videos', id })
    const uploadedBy = doc?.uploadedBy
    return {
      exists: Boolean(doc),
      uploadedBy: uploadedBy === 'Ken' || uploadedBy === 'Nira' ? uploadedBy : null,
      kind: doc?.kind === 'photo' ? 'photo' : 'video',
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
  const [{ exists, uploadedBy, kind }, currentUser] = await Promise.all([
    videoSender(id),
    getCurrentUser(),
  ])

  return (
    <WatchVideoClient id={id} exists={exists} uploadedBy={uploadedBy} currentUser={currentUser} kind={kind} />
  )
}
