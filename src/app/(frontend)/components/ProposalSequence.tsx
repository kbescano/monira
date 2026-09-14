'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export type ProposalBlessing = { name: string; videoUrl: string }
export type ProposalContent = {
  loveLetter: string
  backgroundAudioUrl: string | null
  personalVideoUrl: string | null
  blessingsIntro: string
  secondAudioUrl: string | null
  blessings: ProposalBlessing[]
  cueMessage: string
}

type Step = 'opener' | 'letter' | 'video' | 'blessingsIntro' | 'blessings' | 'cue'
const STEP_ORDER: Step[] = ['opener', 'letter', 'video', 'blessingsIntro', 'blessings', 'cue']

// The first song starts the instant the sequence loads (before her name even
// appears) and plays continuously through the letter and your own video,
// then stops the moment the family-videos section starts. Since the
// letter's own length is fixed by how many phrases it has (not a shared
// budget anymore), how well the song's ending lines up with your video's
// ending now comes down to picking a song roughly the right length for the
// two combined, rather than something the code can force exactly.
const FIRST_AUDIO_STEPS: Step[] = ['opener', 'letter', 'video']

// The second song picks up the instant the first one stops — right as the
// intro before the family videos appears — and stays on, quietly, through
// the family videos themselves so it doesn't compete with them talking.
const SECOND_AUDIO_STEPS: Step[] = ['blessingsIntro', 'blessings']
const SECOND_AUDIO_VOLUME = 0.05

// Fixed hold per phrase in the letter / blessings intro.
const PHRASE_MS = 3000

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
}

// The video's own entrance skips the fade-in — it should feel like it starts
// right away the moment the letter's done, not drift in half a second later.
const instant = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
}

/** Splits text into short phrases at every comma, period, "!", or "?" —
 * shown one at a time rather than as one long block or full sentences.
 * Paragraph breaks are split first so a phrase never spans two paragraphs.
 * Used for both the letter and the blessings intro. */
function splitIntoPhrases(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .flatMap((paragraph) =>
      paragraph
        .trim()
        .split(/(?<=[,.!?])\s+/)
        .map((s) => s.trim()),
    )
    .filter(Boolean)
}

/** A single autoplaying video — attempts autoplay, falls back to a
 * tap-to-play overlay if the browser blocks it (mobile browsers often only
 * allow autoplay-with-sound on the video directly tied to the user's tap,
 * not one chained in afterward via onEnded). Used for both your own video
 * and each family blessing. */
function AutoplayVideo({
  src,
  caption,
  onEnded,
}: {
  src: string
  caption?: string
  onEnded: () => void
}) {
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
  }, [src])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          playsInline
          controls={false}
          onEnded={onEnded}
          onClick={(e) => e.stopPropagation()}
          className="h-full max-h-[88vh] w-full max-w-[95vw] object-contain"
        />
        {needsTap && (
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
      {caption && <p className="font-serif text-lg text-white/90">{caption}</p>}
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
  const [step, setStep] = useState<Step>('opener')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [introPhraseIndex, setIntroPhraseIndex] = useState(0)
  const [blessingIndex, setBlessingIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const secondAudioRef = useRef<HTMLAudioElement>(null)

  const blessings = proposal.blessings
  const phrases = splitIntoPhrases(proposal.loveLetter)
  const introPhrases = splitIntoPhrases(proposal.blessingsIntro)

  const goNext = () => {
    setStep((current) => {
      const i = STEP_ORDER.indexOf(current)
      return i < STEP_ORDER.length - 1 ? STEP_ORDER[i + 1] : current
    })
  }

  // First song — see FIRST_AUDIO_STEPS above.
  useEffect(() => {
    const el = audioRef.current
    if (!el || !proposal.backgroundAudioUrl) return
    if (FIRST_AUDIO_STEPS.includes(step)) {
      if (el.paused) el.play().catch(() => {})
    } else if (!el.paused) {
      el.pause()
    }
  }, [step, proposal.backgroundAudioUrl])

  // Second song — see SECOND_AUDIO_STEPS above. Volume is reset on every run
  // of this effect (harmless if already set) so it's always quiet, however
  // it got started.
  useEffect(() => {
    const el = secondAudioRef.current
    if (!el || !proposal.secondAudioUrl) return
    el.volume = SECOND_AUDIO_VOLUME
    if (SECOND_AUDIO_STEPS.includes(step)) {
      if (el.paused) el.play().catch(() => {})
    } else if (!el.paused) {
      el.pause()
    }
  }, [step, proposal.secondAudioUrl])

  // opener — just her name, a moment to notice something's different.
  useEffect(() => {
    if (step !== 'opener') return
    const t = setTimeout(goNext, 2400)
    return () => clearTimeout(t)
  }, [step])

  // letter — one phrase at a time (split on comma/period/!/?), each held
  // for a fixed PHRASE_MS.
  useEffect(() => {
    if (step !== 'letter') return
    if (phrases.length === 0) {
      goNext()
      return
    }
    const onLast = phraseIndex >= phrases.length - 1
    const t = setTimeout(() => {
      if (onLast) goNext()
      else setPhraseIndex((n) => n + 1)
    }, PHRASE_MS)
    return () => clearTimeout(t)
  }, [step, phraseIndex, phrases.length])

  // video — your own video message, chained by its own onEnded, not a timer.
  useEffect(() => {
    if (step !== 'video') return
    if (!proposal.personalVideoUrl) goNext()
  }, [step, proposal.personalVideoUrl])

  // blessingsIntro — same phrase-by-phrase treatment as the letter, right
  // before the family videos begin.
  useEffect(() => {
    if (step !== 'blessingsIntro') return
    if (introPhrases.length === 0) {
      goNext()
      return
    }
    const onLast = introPhraseIndex >= introPhrases.length - 1
    const t = setTimeout(() => {
      if (onLast) goNext()
      else setIntroPhraseIndex((n) => n + 1)
    }, PHRASE_MS)
    return () => clearTimeout(t)
  }, [step, introPhraseIndex, introPhrases.length])

  // blessings — chained by each video's onEnded, not a timer.
  useEffect(() => {
    if (step !== 'blessings') return
    if (blessings.length === 0) goNext()
  }, [step, blessings.length])

  // Tapping anywhere nudges things forward early — a safety net if a step
  // feels too slow in the actual moment. Not wired up during the video/
  // blessings steps (each video's own onEnded/tap-to-play handles that) or
  // on the final cue (nothing left to advance to — that's the real thing now).
  const handleTapAdvance = () => {
    if (step === 'video' || step === 'blessings' || step === 'cue') return
    goNext()
  }

  const isFullBleedVideo = step === 'video' || step === 'blessings'

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-center ${
        isFullBleedVideo ? '' : 'gap-6 px-6'
      }`}
      onClick={handleTapAdvance}
    >
      {proposal.backgroundAudioUrl && <audio ref={audioRef} src={proposal.backgroundAudioUrl} />}
      {proposal.secondAudioUrl && <audio ref={secondAudioRef} src={proposal.secondAudioUrl} />}

      {/* Warms up the video during the letter, so by the time the video step
          actually mounts, the browser already has a head start on fetching
          it instead of starting from zero — same URL, so the real player
          picks up wherever this got to. Not rendered once we're actually on
          the video step, so there's only ever one element pulling the file. */}
      {proposal.personalVideoUrl && (step === 'opener' || step === 'letter') && (
        <video
          key="preload-video"
          src={proposal.personalVideoUrl}
          preload="auto"
          muted
          playsInline
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        />
      )}

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

        {step === 'letter' && phrases[phraseIndex] && (
          <motion.p
            key={`phrase-${phraseIndex}`}
            {...fade}
            className="max-w-md font-serif text-xl text-white sm:text-2xl"
          >
            {phrases[phraseIndex]}
          </motion.p>
        )}

        {step === 'video' && proposal.personalVideoUrl && (
          <motion.div key="video" {...instant} className="flex h-full w-full items-center justify-center">
            <AutoplayVideo src={proposal.personalVideoUrl} onEnded={goNext} />
          </motion.div>
        )}

        {step === 'blessingsIntro' && introPhrases[introPhraseIndex] && (
          <motion.p
            key={`intro-phrase-${introPhraseIndex}`}
            {...fade}
            className="max-w-md font-serif text-xl text-white sm:text-2xl"
          >
            {introPhrases[introPhraseIndex]}
          </motion.p>
        )}

        {step === 'blessings' && blessings[blessingIndex] && (
          <motion.div
            key={`blessing-${blessingIndex}`}
            {...fade}
            className="flex h-full w-full flex-col items-center justify-center gap-4"
          >
            <AutoplayVideo
              src={blessings[blessingIndex].videoUrl}
              caption={blessings[blessingIndex].name}
              onEnded={() => {
                if (blessingIndex < blessings.length - 1) setBlessingIndex((n) => n + 1)
                else goNext()
              }}
            />
          </motion.div>
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
