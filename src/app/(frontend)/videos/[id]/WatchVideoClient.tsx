'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isMobileOrTablet } from '../../components/isMobileOrTablet'
import { revealVideo, burnVideo } from './actions'
import type { Person } from '@/lib/dailyPassword'

type State = 'idle' | 'checking' | 'blocked' | 'playing' | 'gone'
type Kind = 'video' | 'photo'

const MAX_LOOPS = 5
// How long a photo stays on screen before it auto-closes — there's no
// natural "ended" event for a still image, so this stands in for one.
const PHOTO_DISPLAY_MS = 5_000

export default function WatchVideoClient({
  id,
  exists,
  uploadedBy,
  currentUser,
  kind,
}: {
  id: string
  exists: boolean
  uploadedBy: Person | null
  currentUser: Person | null
  kind: Kind
}) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const burnedRef = useRef(false)
  const loopCountRef = useRef(0)
  const photoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [state, setState] = useState<State>(exists ? 'idle' : 'gone')
  const [url, setUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState<string | null>(null)
  const [isSender, setIsSender] = useState(false)
  const [revealedKind, setRevealedKind] = useState<Kind>(kind)
  const [progress, setProgress] = useState(0) // 0..1

  const reveal = async () => {
    if (!isMobileOrTablet()) {
      setState('blocked')
      return
    }
    setState('checking')
    const result = await revealVideo(id)
    if (!result.url) {
      setState('gone')
      return
    }
    setUrl(result.url)
    setCaption(result.caption)
    setIsSender(Boolean(result.isSender))
    setRevealedKind(result.kind ?? kind)
    setState('playing')
  }

  // Fires the moment the <video> mounts for the 'playing' state. Calling
  // play() here (rather than relying only on the autoPlay attribute) keeps
  // it tied closely to the "Tap to watch" click that led here, which is what
  // lets browsers allow unmuted autoplay in the first place.
  useEffect(() => {
    if (state === 'playing' && revealedKind === 'video') {
      videoRef.current?.play().catch(() => {
        // Autoplay blocked by the browser — the native controls still let
        // them press play manually, so this is a silent fallback.
      })
    }
  }, [state, revealedKind])

  const leave = () => router.push('/videos')

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    setProgress(v.currentTime / v.duration)
  }

  // The actual "view" moment for a video — fires once the browser has
  // genuinely started rendering frames (not just fetched metadata), so this
  // is the safe point to delete the source. Guarded so a seek/rebuffer
  // replay doesn't re-fire it.
  const handlePlaying = () => {
    if (burnedRef.current) return
    burnedRef.current = true
    burnVideo(id)
  }

  // Loops the clip in place — up to MAX_LOOPS total plays — then auto-closes.
  // The ✕ button still lets them close early at any point.
  const handleEnded = () => {
    loopCountRef.current += 1
    if (loopCountRef.current >= MAX_LOOPS) {
      leave()
      return
    }
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
  }

  // The photo equivalent of "playing": fires once the <img> has genuinely
  // finished loading, then counts a display timer up to auto-close — the
  // still-image stand-in for a video's loop-then-end.
  const handlePhotoLoad = () => {
    if (burnedRef.current) return
    burnedRef.current = true
    burnVideo(id)

    const startedAt = Date.now()
    photoTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt
      setProgress(Math.min(elapsed / PHOTO_DISPLAY_MS, 1))
      if (elapsed >= PHOTO_DISPLAY_MS) {
        if (photoTimerRef.current) clearInterval(photoTimerRef.current)
        leave()
      }
    }, 40)
  }

  useEffect(() => {
    return () => {
      if (photoTimerRef.current) clearInterval(photoTimerRef.current)
    }
  }, [])

  if (state === 'gone') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-blush via-cream to-cream px-6 text-center">
        <span className="text-4xl">👻</span>
        <h1 className="font-serif text-xl text-berry">This one&apos;s already been watched</h1>
        <p className="max-w-sm text-sm text-plum/60">
          Vanishing videos and photos only show once — looks like this one is gone for good.
        </p>
      </div>
    )
  }

  if (state === 'blocked') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-blush via-cream to-cream px-6 text-center">
        <span className="text-4xl">📱</span>
        <h1 className="font-serif text-xl text-berry">Phone or tablet only</h1>
        <p className="max-w-sm text-sm text-plum/60">Open this link on your phone or iPad to watch it.</p>
      </div>
    )
  }

  if (state === 'playing' && url) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-black">
        {/* Story-style progress bar */}
        <div className="absolute inset-x-3 top-3 z-20 h-1 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>

        <button
          onClick={leave}
          aria-label="Close"
          className="absolute right-3 top-8 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          ✕
        </button>

        {caption && (
          <p className="absolute inset-x-16 top-9 z-10 text-center font-serif text-base text-white/90">
            {caption}
          </p>
        )}

        {revealedKind === 'photo' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" onLoad={handlePhotoLoad} className="h-full w-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            src={url}
            controls
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onPlaying={handlePlaying}
            onEnded={handleEnded}
            className="h-full w-full object-contain"
          />
        )}

        <p className="absolute inset-x-0 bottom-3 z-10 text-center text-xs text-white/50">
          {isSender
            ? "You sent this — it'll disappear once they see it."
            : "This is gone now — it won't show again."}
        </p>
      </div>
    )
  }

  const kindLabel = kind === 'photo' ? 'photo' : 'video'
  const heading =
    uploadedBy && currentUser && uploadedBy === currentUser
      ? `You sent a ${kindLabel}`
      : uploadedBy
        ? `${uploadedBy} sent you a ${kindLabel}`
        : `Someone sent you a ${kindLabel}`

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-blush via-cream to-cream px-6 text-center">
      <span className="text-4xl">{kind === 'photo' ? '📷' : '🎬'}</span>
      <h1 className="font-serif text-xl text-berry">{heading}</h1>
      <p className="max-w-sm text-sm text-plum/60">This shows once, then it&apos;s gone. Ready?</p>
      <button
        onClick={reveal}
        disabled={state === 'checking'}
        className="tap-shrink rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition hover:bg-berry disabled:opacity-60"
      >
        {state === 'checking' ? 'Loading…' : kind === 'photo' ? 'Tap to view' : 'Tap to watch'}
      </button>
    </div>
  )
}
