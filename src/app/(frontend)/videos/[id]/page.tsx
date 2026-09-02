import { getPayloadClient } from '@/lib/payload'
import WatchVideoClient from './WatchVideoClient'

export const dynamic = 'force-dynamic'

async function videoExists(id: string): Promise<boolean> {
  try {
    const payload = await getPayloadClient()
    const doc = await payload.findByID({ collection: 'videos', id })
    return Boolean(doc)
  } catch {
    return false
  }
}

export default async function WatchVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exists = await videoExists(id)

  return <WatchVideoClient id={id} exists={exists} />
}
