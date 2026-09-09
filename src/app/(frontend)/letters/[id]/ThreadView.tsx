'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceRecorderField from '../../components/VoiceRecorderField'
import { uploadVoiceNote } from '../../lib/uploadVoiceNote'
import { toggleHeart } from '../actions'
import type { Person } from '@/lib/dailyPassword'

export type Bubble = {
  id: string
  from: string | null
  message: string | null
  voiceNoteUrl: string | null
  heart: boolean
  heartedBy: string[]
  createdAt: string
}

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function MessageBubble({
  bubble,
  mine,
  currentUser,
  onChanged,
}: {
  bubble: Bubble
  mine: boolean
  currentUser: Person | null
  onChanged: () => void
}) {
  const [heartedBy, setHeartedBy] = useState(bubble.heartedBy)
  const [busy, setBusy] = useState(false)
  const isBareHeart = bubble.heart && !bubble.message && !bubble.voiceNoteUrl
  const iHearted = Boolean(currentUser && heartedBy.includes(currentUser))

  const handleToggleHeart = async () => {
    if (!currentUser || busy) return
    const wasHearted = heartedBy.includes(currentUser)
    setBusy(true)
    setHeartedBy((prev) => (wasHearted ? prev.filter((p) => p !== currentUser) : [...prev, currentUser]))
    const result = await toggleHeart(bubble.id)
    if (result.ok) {
      setHeartedBy(result.heartedBy)
      onChanged()
    } else {
      setHeartedBy((prev) => (wasHearted ? [...prev, currentUser] : prev.filter((p) => p !== currentUser)))
    }
    setBusy(false)
  }

  return (
    <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
      {isBareHeart ? (
        <span className="px-1 text-4xl">❤️</span>
      ) : (
        <div
          className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
            mine ? 'rounded-br-md bg-rose text-white' : 'rounded-bl-md border border-rose/15 bg-white text-plum'
          }`}
        >
          {bubble.message && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{bubble.message}</p>
          )}
          {bubble.voiceNoteUrl && (
            <audio
              src={bubble.voiceNoteUrl}
              controls
              className={`h-9 w-56 max-w-full ${bubble.message ? 'mt-2' : ''}`}
            />
          )}
        </div>
      )}
      <div className={`mt-1 flex items-center gap-1.5 px-1 ${mine ? 'flex-row-reverse' : ''}`}>
        <span className="text-[11px] text-plum/40">{formatTime(bubble.createdAt)}</span>
        <button
          onClick={handleToggleHeart}
          disabled={!currentUser || busy}
          aria-label={iHearted ? 'Remove your heart' : 'Heart this message'}
          aria-pressed={iHearted}
          className="flex items-center gap-1 text-xs disabled:opacity-50"
        >
          <span>{iHearted ? '❤️' : '🤍'}</span>
          {heartedBy.length > 0 && <span className="text-plum/50">{heartedBy.join(', ')}</span>}
        </button>
      </div>
    </div>
  )
}

export default function ThreadView({
  rootId,
  root,
  replies,
  currentUser,
  defaultTo,
}: {
  rootId: string
  root: Bubble | null
  replies: Bubble[]
  currentUser: Person | null
  defaultTo: Person
}) {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [message, setMessage] = useState('')
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [recording, setRecording] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bubbles = root ? [root, ...replies] : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [bubbles.length])

  // Light polling so a reply from the other person while you're both looking
  // at the same thread shows up without a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 15_000)
    return () => clearInterval(interval)
  }, [router])

  const send = async (data: { message?: string; voiceNoteId?: string }) => {
    setError(null)
    setSending(true)
    try {
      const res = await fetch('/api/love-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: defaultTo,
          from: currentUser ?? undefined,
          replyTo: Number(rootId),
          message: data.message,
          voiceNote: data.voiceNoteId ? Number(data.voiceNoteId) : undefined,
        }),
      })
      if (!res.ok) throw new Error('Could not send that. Please try again.')

      setMessage('')
      setVoiceBlob(null)
      setRecording(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !voiceBlob) return
    const voiceNoteId = voiceBlob ? await uploadVoiceNote(voiceBlob).catch(() => null) : null
    if (voiceBlob && !voiceNoteId) {
      setError('Could not upload the voice note. Please try again.')
      return
    }
    await send({ message: message.trim() || undefined, voiceNoteId: voiceNoteId ?? undefined })
  }

  if (!root) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-blush via-cream to-cream px-6 text-center">
        <span className="text-4xl">💌</span>
        <h1 className="font-serif text-xl text-berry">This letter isn&apos;t here anymore</h1>
        <button
          onClick={() => router.push('/letters')}
          className="tap-shrink rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition hover:bg-berry"
        >
          Back to letters
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-cream">
      <div className="glass flex flex-shrink-0 items-center gap-3 border-b border-rose/10 px-4 py-3">
        <button
          onClick={() => router.push('/letters')}
          aria-label="Back to letters"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-berry/70 transition hover:bg-rose/10 hover:text-berry"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 5 8 12l7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div>
          <h1 className="font-script text-xl leading-none text-berry">To {defaultTo}</h1>
          <p className="text-xs text-plum/50">
            {bubbles.length} {bubbles.length === 1 ? 'message' : 'messages'}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-8">
        {bubbles.map((bubble) => (
          <MessageBubble
            key={bubble.id}
            bubble={bubble}
            mine={Boolean(currentUser && bubble.from === currentUser)}
            currentUser={currentUser}
            onChanged={() => router.refresh()}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 border-t border-rose/10 bg-cream px-4 py-3 sm:px-6">
        {error && <p className="mb-2 text-xs text-berry">{error}</p>}
        {recording ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <VoiceRecorderField blob={voiceBlob} onRecorded={setVoiceBlob} disabled={sending} />
            </div>
            {voiceBlob ? (
              <button
                onClick={handleSend}
                disabled={sending}
                aria-label="Send voice reply"
                className="tap-shrink flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-rose text-white shadow-md transition hover:bg-berry disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 12h15M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRecording(false)}
                className="flex-shrink-0 text-xs font-medium text-berry/60 underline underline-offset-2 hover:text-berry"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setRecording(true)}
              disabled={sending}
              aria-label="Record a voice reply"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-berry/70 transition hover:bg-rose/10 hover:text-berry disabled:opacity-50"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M5 11a7 7 0 0 0 14 0M12 18v3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Reply…"
              rows={1}
              maxLength={4000}
              disabled={sending}
              className="max-h-32 flex-1 resize-none rounded-2xl border border-rose/20 bg-white px-4 py-2.5 text-[15px] leading-relaxed text-plum placeholder:text-plum/40 focus:border-rose/50 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              aria-label="Send reply"
              className="tap-shrink flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-rose text-white shadow-md transition hover:bg-berry disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 12h15M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
