'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isMobileOrTablet } from '../../components/isMobileOrTablet'
import { revealVideo, burnVideo } from './actions'
import type { Person } from '@/lib/dailyPassword'

type State = 'idle' | 'checking' | 'blocked' | 'playing' | 'gone'

export default function WatchVideoClient({
  id,
  exists,
  uploadedBy,
  currentUser,
}: {
  id: string
  exists: boolean
  uploadedBy: Person | null
  currentUser: Person | null
}) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const burnedRef = useRef(false)
  const loopCountRef = useRef(0)

  const MAX_LOOPS = 5

  const [state, setState] = useState<State>(exists ? 'idle' : 'gone')
  const [url, setUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState<string | null>(null)
  const [isSender, setIsSender] = useState(false)
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
    setState('playing')
  }

  // Fires the moment the <video> mounts for the 'playing' state. Calling
  // play() here (rather than relying only on the autoPlay attribute) keeps
  // it tied closely to the "Tap to watch" click that led here, which is what
  // lets browsers allow unmuted autoplay in the first place.
  useEffect(() => {
    if (state === 'playing') {
      videoRef.current?.play().catch(() => {
        // Autoplay blocked by the browser — the native controls still let
        // them press play manually, so this is a silent fallback.
      })
    }
  }, [state])

  const leave = () => router.push('/videos')

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    setProgress(v.currentTime / v.duration)
  }

  // The actual "view" moment — fires once the browser has genuinely started
  // rendering frames (not just fetched metadata), so this is the safe point
  // to delete the source. Guarded so a seek/rebuffer replay doesn't re-fire it.
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

  if (state === 'gone') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-blush via-cream to-cream px-6 text-center">
        <span className="text-4xl">👻</span>
        <h1 className="font-serif text-xl text-berry">This one&apos;s already been watched</h1>
        <p className="max-w-sm text-sm text-plum/60">
          Vanishing videos only play once — looks like this one is gone for good.
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

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
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

        <p className="absolute inset-x-0 bottom-3 z-10 text-center text-xs text-white/50">
          {isSender
            ? "You sent this — it'll disappear once they watch it."
            : "This is gone now — it won't play again."}
        </p>
      </div>
    )
  }

  const heading =
    uploadedBy && currentUser && uploadedBy === currentUser
      ? 'You sent a video'
      : uploadedBy
        ? `${uploadedBy} sent you a video`
        : 'Someone sent you a video'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-blush via-cream to-cream px-6 text-center">
      <span className="text-4xl">🎬</span>
      <h1 className="font-serif text-xl text-berry">{heading}</h1>
      <p className="max-w-sm text-sm text-plum/60">This plays once, then it&apos;s gone. Ready?</p>
      <button
        onClick={reveal}
        disabled={state === 'checking'}
        className="tap-shrink rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition hover:bg-berry disabled:opacity-60"
      >
        {state === 'checking' ? 'Loading…' : 'Tap to watch'}
      </button>
    </div>
  )
}
