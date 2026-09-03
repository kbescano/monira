'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { togglePin } from './actions'
import type { Person } from '@/lib/dailyPassword'

type Letter = {
  id: string
  to: string
  message: string
  createdAt: string
  pinned: boolean
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
      <p className="whitespace-pre-line font-serif text-[17px] leading-relaxed text-plum/85">
        {letter.message}
      </p>
    </article>
  )
}
