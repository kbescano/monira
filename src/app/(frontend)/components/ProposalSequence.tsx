'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

export type ProposalContent = {
  personalVideoUrl: string | null
}

// Longest AutoplayVideo will ever wait on canplaythrough before starting
// anyway — a safety net so a genuinely bad connection can't leave her
// staring at the loading heart forever during the actual moment.
const MAX_VIDEO_BUFFER_MS = 90_000

/** A single autoplaying video — waits behind a loading heart icon for the
 * browser's own "this should play through without stalling" signal before
 * starting, rather than starting immediately and risking a stall mid-way
 * through a large file. Falls back to a tap-to-play overlay if autoplay
 * itself gets blocked once ready (mobile browsers often only allow
 * autoplay-with-sound on the video directly tied to the user's tap, not one
 * chained in afterward). */
function AutoplayVideo({ src, onEnded }: { src: string; onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const startedRef = useRef(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [ready, setReady] = useState(false)

  const startPlaying = () => {
    if (startedRef.current) return
    startedRef.current = true
    setReady(true)
    const el = videoRef.current
    if (!el) return
    const playPromise = el.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => setNeedsTap(true))
    }
  }

  useEffect(() => {
    startedRef.current = false
    setReady(false)
    setNeedsTap(false)
    const el = videoRef.current
    if (el) el.currentTime = 0

    const maxTimer = setTimeout(startPlaying, MAX_VIDEO_BUFFER_MS)
    return () => clearTimeout(maxTimer)
  }, [src])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        playsInline
        controls
        controlsList="nodownload"
        preload="auto"
        onCanPlayThrough={startPlaying}
        onEnded={onEnded}
        className="h-full w-full object-contain"
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            className="block text-6xl"
          >
            ❤️
          </motion.span>
        </div>
      )}

      {ready && needsTap && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            videoRef.current?.play().catch(() => {})
            setNeedsTap(false)
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg text-white"
        >
          ▶ Tap to play
        </button>
      )}
    </div>
  )
}

export default function ProposalSequence({
  proposal,
  onDone,
}: {
  proposal: ProposalContent
  onDone: () => void
}) {
  // Nothing to show at all if there's no video yet — close immediately
  // rather than leaving a blank black screen up.
  useEffect(() => {
    if (!proposal.personalVideoUrl) onDone()
  }, [proposal.personalVideoUrl, onDone])

  if (!proposal.personalVideoUrl) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-center">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDone()
        }}
        aria-label="Close"
        className="absolute right-4 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition hover:bg-white/20"
      >
        ✕
      </button>

      {/* The video ending IS the cue — nothing left to show after it, so
          this closes the whole thing straight back to whatever's
          underneath (the real moment happens in person right as it ends). */}
      <AutoplayVideo src={proposal.personalVideoUrl} onEnded={onDone} />
    </div>
  )
}
