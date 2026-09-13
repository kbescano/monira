'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export type ProposalPhoto = { url: string; alt: string }
export type ProposalBlessing = { name: string; videoUrl: string }
export type ProposalContent = {
  memoryPhotos: ProposalPhoto[]
  blessings: ProposalBlessing[]
  finalMessage: string
  cueMessage: string
}

type Step = 'opener' | 'reasons' | 'turn' | 'memories' | 'blessings' | 'message' | 'cue'
const STEP_ORDER: Step[] = ['opener', 'reasons', 'turn', 'memories', 'blessings', 'message', 'cue']

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
}

/** A single blessing video — attempts autoplay, falls back to a tap-to-play
 * overlay if the browser blocks it (mobile browsers often only allow
 * autoplay-with-sound on the video that's directly tied to the user's tap,
 * not the second/third one chained in afterward). */
function BlessingVideo({ blessing, onEnded }: { blessing: ProposalBlessing; onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [needsTap, setNeedsTap] = useState(false)

  useEffect(() => {
    setNeedsTap(false)
    const el = videoRef.current
    if (!el) return
    el.currentTime = 0
    const playPromise = el.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => setNeedsTap(true))
    }
  }, [blessing.videoUrl])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <video
          ref={videoRef}
          src={blessing.videoUrl}
          playsInline
          controls={false}
          onEnded={onEnded}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[60vh] w-full max-w-sm rounded-2xl object-contain"
        />
        {needsTap && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              videoRef.current?.play().catch(() => {})
              setNeedsTap(false)
            }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-lg text-white"
          >
            ▶ Tap to play
          </button>
        )}
      </div>
      <p className="font-serif text-lg text-white/90">{blessing.name}</p>
    </div>
  )
}

export default function ProposalSequence({
  reasons,
  proposal,
  onDone,
}: {
  reasons: string[]
  proposal: ProposalContent
  onDone: () => void
}) {
  const [step, setStep] = useState<Step>('opener')
  const [reasonIndex, setReasonIndex] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [blessingIndex, setBlessingIndex] = useState(0)

  const photos = proposal.memoryPhotos
  const blessings = proposal.blessings

  const goNext = () => {
    setStep((current) => {
      const i = STEP_ORDER.indexOf(current)
      return i < STEP_ORDER.length - 1 ? STEP_ORDER[i + 1] : current
    })
  }

  // opener — just her name, a moment to notice something's different.
  useEffect(() => {
    if (step !== 'opener') return
    const t = setTimeout(goNext, 2400)
    return () => clearTimeout(t)
  }, [step])

  // reasons — cycle through every one, then hold on the tally line.
  useEffect(() => {
    if (step !== 'reasons') return
    if (reasons.length === 0) {
      goNext()
      return
    }
    const holdingTally = reasonIndex >= reasons.length
    const t = setTimeout(() => {
      if (holdingTally) goNext()
      else setReasonIndex((n) => n + 1)
    }, holdingTally ? 2800 : 2200)
    return () => clearTimeout(t)
  }, [step, reasonIndex, reasons.length])

  // turn — the pivot line, held quietly.
  useEffect(() => {
    if (step !== 'turn') return
    const t = setTimeout(goNext, 3200)
    return () => clearTimeout(t)
  }, [step])

  // memories — a fast flash through your life together, paced to land
  // around ~18s total regardless of how many photos there are.
  useEffect(() => {
    if (step !== 'memories') return
    if (photos.length === 0) {
      goNext()
      return
    }
    const onLast = photoIndex >= photos.length - 1
    const interval = Math.max(180, Math.min(700, 18000 / photos.length))
    const t = setTimeout(() => {
      if (onLast) goNext()
      else setPhotoIndex((n) => n + 1)
    }, onLast ? 2400 : interval)
    return () => clearTimeout(t)
  }, [step, photoIndex, photos.length])

  // blessings — chained by each video's onEnded, not a timer.
  useEffect(() => {
    if (step !== 'blessings') return
    if (blessings.length === 0) goNext()
  }, [step, blessings.length])

  // message — your own written words, held long enough to actually read.
  useEffect(() => {
    if (step !== 'message') return
    if (!proposal.finalMessage.trim()) {
      goNext()
      return
    }
    const holdMs = Math.max(5000, proposal.finalMessage.length * 70)
    const t = setTimeout(goNext, holdMs)
    return () => clearTimeout(t)
  }, [step, proposal.finalMessage])

  // Tapping anywhere nudges things forward early — a safety net if a step
  // feels too slow in the actual moment. Not wired up during the blessings
  // step itself (each video's own onEnded/tap-to-play handles that one) or
  // on the final cue (nothing left to advance to — that's the real thing now).
  const handleTapAdvance = () => {
    if (step === 'blessings' || step === 'cue') return
    goNext()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black px-6 text-center"
      onClick={handleTapAdvance}
    >
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

      <AnimatePresence mode="wait">
        {step === 'opener' && (
          <motion.h1 key="opener" {...fade} className="font-script text-5xl text-white sm:text-6xl">
            Nira
          </motion.h1>
        )}

        {step === 'reasons' &&
          (reasonIndex < reasons.length ? (
            <motion.p
              key={`reason-${reasonIndex}`}
              {...fade}
              className="max-w-md font-serif text-xl text-white sm:text-2xl"
            >
              &ldquo;{reasons[reasonIndex]}&rdquo;
            </motion.p>
          ) : (
            <motion.p key="tally" {...fade} className="max-w-sm font-serif text-xl text-white sm:text-2xl">
              {reasons.length} reasons. And I could keep going forever.
            </motion.p>
          ))}

        {step === 'turn' && (
          <motion.p key="turn" {...fade} className="max-w-sm font-script text-4xl text-white sm:text-5xl">
            But saying it still isn&apos;t enough.
          </motion.p>
        )}

        {step === 'memories' && photos[photoIndex] && (
          <motion.div key={`photo-${photoIndex}`} {...fade} className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[photoIndex].url}
              alt={photos[photoIndex].alt}
              className="max-h-[65vh] w-full max-w-sm rounded-2xl object-contain"
            />
            {photoIndex === photos.length - 1 && (
              <p className="font-serif text-base text-white/80 sm:text-lg">
                So I asked the people who&apos;ve known you longest.
              </p>
            )}
          </motion.div>
        )}

        {step === 'blessings' && blessings[blessingIndex] && (
          <motion.div key={`blessing-${blessingIndex}`} {...fade}>
            <BlessingVideo
              blessing={blessings[blessingIndex]}
              onEnded={() => {
                if (blessingIndex < blessings.length - 1) setBlessingIndex((n) => n + 1)
                else goNext()
              }}
            />
          </motion.div>
        )}

        {step === 'message' && proposal.finalMessage.trim() && (
          <motion.p
            key="message"
            {...fade}
            className="max-w-md whitespace-pre-wrap font-serif text-xl text-white sm:text-2xl"
          >
            {proposal.finalMessage}
          </motion.p>
        )}

        {step === 'cue' && (
          <motion.p key="cue" {...fade} className="font-script text-5xl text-white sm:text-6xl">
            {proposal.cueMessage || 'Turn around.'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
