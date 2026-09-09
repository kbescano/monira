'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { unsendVideo, saveVideo } from './actions'

export default function VideoListItem({
  id,
  caption,
  mine,
  kind,
  canSave,
  savedByMe,
}: {
  id: string
  caption: string | null
  mine: boolean
  kind: 'video' | 'photo' | 'voice'
  canSave: boolean
  savedByMe: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const label = kind === 'voice' ? 'voice message' : kind

  const handleUnsend = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const confirmMessage = savedByMe
      ? `Delete this saved ${label}? It deletes it for good.`
      : `Unsend this ${label}? It deletes it for good.`
    if (!window.confirm(confirmMessage)) return
    setBusy(true)
    const result = await unsendVideo(id)
    if (result.ok) {
      router.refresh()
    } else {
      setBusy(false)
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (saving || saved) return
    setSaving(true)
    const result = await saveVideo(id)
    if (result.ok) {
      setSaved(true)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <Link
      href={`/videos/${id}`}
      className="tap-shrink flex items-center gap-4 rounded-2xl border border-rose/15 bg-white/70 px-5 py-4 shadow-sm shadow-rose/5 transition hover:border-rose/30"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose/10 text-lg">
        {kind === 'photo' ? '📷' : kind === 'voice' ? '🎙️' : '🎬'}
      </span>
      <span className="flex-1 text-left">
        <span className="block text-sm font-medium text-plum">
          {caption || (mine ? 'Waiting for them to see it' : `A ${label}, waiting for you`)}
        </span>
        <span className="block text-xs text-berry">
          {mine ? 'Sent — tap to preview →' : 'Tap to view — shows once →'}
        </span>
      </span>
      {canSave && !saved && (
        <button
          onClick={handleSave}
          disabled={saving}
          aria-label="Save"
          className="flex-shrink-0 rounded-full p-1.5 text-plum/30 transition hover:bg-rose/10 hover:text-berry disabled:opacity-50"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 4h12v16l-6-4-6 4V4Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {(mine || savedByMe) && (
        <button
          onClick={handleUnsend}
          disabled={busy}
          aria-label={savedByMe ? 'Delete' : 'Unsend'}
          className="flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium text-berry/60 transition hover:bg-rose/10 hover:text-berry disabled:opacity-50"
        >
          {busy ? '…' : savedByMe ? 'Delete' : 'Unsend'}
        </button>
      )}
    </Link>
  )
}
