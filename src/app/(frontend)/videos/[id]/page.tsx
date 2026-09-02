import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import type { Person } from '@/lib/dailyPassword'
import WatchVideoClient from './WatchVideoClient'

export const dynamic = 'force-dynamic'

// Looking this up only reveals *who sent it* (for the "Ken sent you a video"
// heading before the tap) — it never touches the file itself, so it can't
// accidentally burn the once-only view.
async function videoSender(id: string): Promise<{ exists: boolean; uploadedBy: Person | null }> {
  try {
    const payload = await getPayloadClient()
    const doc = await payload.findByID({ collection: 'videos', id })
    const uploadedBy = doc?.uploadedBy
    return { exists: Boolean(doc), uploadedBy: uploadedBy === 'Ken' || uploadedBy === 'Nira' ? uploadedBy : null }
  } catch {
    return { exists: false, uploadedBy: null }
  }
}

export default async function WatchVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [{ exists, uploadedBy }, currentUser] = await Promise.all([videoSender(id), getCurrentUser()])

  return <WatchVideoClient id={id} exists={exists} uploadedBy={uploadedBy} currentUser={currentUser} />
}
