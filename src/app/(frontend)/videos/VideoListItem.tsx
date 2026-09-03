'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { unsendVideo } from './actions'

export default function VideoListItem({
  id,
  caption,
  mine,
  kind,
}: {
  id: string
  caption: string | null
  mine: boolean
  kind: 'video' | 'photo'
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const handleUnsend = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Unsend this ${kind}? It deletes it for good.`)) return
    setBusy(true)
    const result = await unsendVideo(id)
    if (result.ok) {
      router.refresh()
    } else {
      setBusy(false)
    }
  }

  return (
    <Link
      href={`/videos/${id}`}
      className="tap-shrink flex items-center gap-4 rounded-2xl border border-rose/15 bg-white/70 px-5 py-4 shadow-sm shadow-rose/5 transition hover:border-rose/30"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose/10 text-lg">
        {kind === 'photo' ? '📷' : '🎬'}
      </span>
      <span className="flex-1 text-left">
        <span className="block text-sm font-medium text-plum">
          {caption || (mine ? 'Waiting for them to see it' : `A ${kind}, waiting for you`)}
        </span>
        <span className="block text-xs text-berry">
          {mine ? 'Sent — tap to preview →' : 'Tap to view — shows once →'}
        </span>
      </span>
      {mine && (
        <button
          onClick={handleUnsend}
          disabled={busy}
          aria-label="Unsend"
          className="flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium text-berry/60 transition hover:bg-rose/10 hover:text-berry disabled:opacity-50"
        >
          {busy ? '…' : 'Unsend'}
        </button>
      )}
    </Link>
  )
}
