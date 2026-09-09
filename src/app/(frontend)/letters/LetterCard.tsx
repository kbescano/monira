'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { togglePin, toggleHeart } from './actions'
import VoiceNotePlayer from '../components/VoiceNotePlayer'
import type { Person } from '@/lib/dailyPassword'

type Letter = {
  id: string
  to: string
  message: string | null
  voiceNoteUrl: string | null
  createdAt: string
  pinned: boolean
  replyCount: number
  heartedBy: string[]
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

export default function LetterCard({
  letter,
  currentUser,
}: {
  letter: Letter
  currentUser: Person | null
}) {
  const router = useRouter()
  const [pinned, setPinned] = useState(letter.pinned)
  const [busy, setBusy] = useState(false)
  const [heartedBy, setHeartedBy] = useState(letter.heartedBy)
  const [heartBusy, setHeartBusy] = useState(false)

  const handleTogglePin = async () => {
    if (!currentUser || busy) return
    const next = !pinned
    setBusy(true)
    setPinned(next) // optimistic — feels instant, reverted below if it fails
    const result = await togglePin(letter.id, next)
    if (!result.ok) {
      setPinned(!next)
    } else {
      router.refresh()
    }
    setBusy(false)
  }

  // A one-tap ❤️ reaction on this letter itself — right from the feed, no
  // need to open the thread. Toggling never creates a reply.
  const handleToggleHeart = async () => {
    if (!currentUser || heartBusy) return
    const wasHearted = heartedBy.includes(currentUser)
    setHeartBusy(true)
    setHeartedBy((prev) => (wasHearted ? prev.filter((p) => p !== currentUser) : [...prev, currentUser]))
    const result = await toggleHeart(letter.id)
    if (result.ok) {
      setHeartedBy(result.heartedBy)
      router.refresh()
    } else {
      setHeartedBy((prev) => (wasHearted ? [...prev, currentUser] : prev.filter((p) => p !== currentUser)))
    }
    setHeartBusy(false)
  }

  const iHearted = Boolean(currentUser && heartedBy.includes(currentUser))

  return (
    <article
      className={`rounded-3xl border px-6 py-6 shadow-sm sm:px-8 sm:py-8 ${
        pinned ? 'border-rose/30 bg-white shadow-rose/10' : 'border-rose/15 bg-white/70 shadow-rose/5'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose">
          {pinned && <span aria-label="Pinned">📌</span>}
          To {letter.to}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-plum/40">{formatDate(letter.createdAt)}</span>
          {currentUser && (
            <button
              onClick={handleTogglePin}
              disabled={busy}
              aria-label={pinned ? 'Unpin this letter' : 'Pin this letter to the top'}
              aria-pressed={pinned}
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
                pinned ? 'text-rose hover:bg-rose/10' : 'text-plum/30 hover:bg-rose/10 hover:text-rose'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 4h6l-1 6 4 4v1H6v-1l4-4-1-6Z"
                  fill={pinned ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M12 15v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {letter.message && (
        <p className="whitespace-pre-line font-serif text-[17px] leading-relaxed text-plum/85">
          {letter.message}
        </p>
      )}
      {letter.voiceNoteUrl && (
        <VoiceNotePlayer
          src={letter.voiceNoteUrl}
          className={`h-10 w-full ${letter.message ? 'mt-4' : ''}`}
        />
      )}

      <div className="mt-4 flex items-center justify-between border-t border-rose/10 pt-3">
        <Link
          href={`/letters/${letter.id}`}
          className="text-xs font-medium text-berry/70 transition hover:text-berry"
        >
          {letter.replyCount > 0
            ? `${letter.replyCount} ${letter.replyCount === 1 ? 'reply' : 'replies'} →`
            : 'Reply →'}
        </Link>
        <button
          onClick={handleToggleHeart}
          disabled={!currentUser || heartBusy}
          aria-label={iHearted ? 'Remove your heart' : 'Heart this letter'}
          aria-pressed={iHearted}
          className="flex items-center gap-1.5 text-xs text-berry/70 transition hover:text-rose disabled:opacity-50"
        >
          <span>{iHearted ? '❤️' : '🤍'}</span>
          {heartedBy.length > 0 && <span>{heartedBy.join(', ')}</span>}
        </button>
      </div>
    </article>
  )
}
