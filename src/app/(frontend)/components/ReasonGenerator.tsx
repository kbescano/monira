'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { notifyReasonTap } from '../actions'
import { reasonsMusic } from '../content'
import TunnelScene, { type TunnelControls } from './TunnelScene'
import { useYouTubeMusic } from './useYouTubeMusic'

function shuffled<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// A fresh random order of every reason, optionally leading with one in
// particular — so the whole set is seen before anything repeats.
function Equalizer({ active }: { active: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-3.5 items-end gap-[3px]">
      {[0, 0.25, 0.1, 0.35].map((delay) => (
        <span
          key={delay}
          className={`h-full w-[3px] origin-bottom rounded-full bg-rose ${
            active ? 'motion-safe:animate-equalizer' : ''
          }`}
          style={{ animationDelay: `${delay}s`, transform: active ? undefined : 'scaleY(0.3)' }}
        />
      ))}
    </span>
  )
}

function buildOrder(reasons: string[], firstIndex: number | null): string[] {
  const items = reasons.map((text, i) => ({ text: text.trim(), i })).filter((item) => item.text)
  const first = items.find((item) => item.i === firstIndex)
  const rest = shuffled(items.filter((item) => item !== first))
  return [...(first ? [first] : []), ...rest].map((item) => item.text)
}

export default function ReasonGenerator({
  reasons,
  todayIndex,
}: {
  reasons: string[]
  /** The reason of the day — the first one you meet the first time you fall in. */
  todayIndex?: number | null
}) {
  const reduce = useReducedMotion() ?? false
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [portalOrder, setPortalOrder] = useState<string[]>([])
  const [focused, setFocused] = useState(0)
  const [moved, setMoved] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const controlsRef = useRef<TunnelControls | null>(null)
  const dives = useRef(0)
  const [musicHost, setMusicHost] = useState<HTMLDivElement | null>(null)
  const music = useYouTubeMusic(reasonsMusic.videoId, musicHost)
  const { prepare: prepareMusic, play: playMusic, pause: pauseMusic } = music

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get the player ready as the button nears the screen, so that by the time
  // it's tapped the music can start right inside that tap.
  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prepareMusic()
          io.disconnect()
        }
      },
      { rootMargin: '800px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [prepareMusic])

  const openPortal = () => {
    setPortalOrder(buildOrder(reasons, dives.current === 0 ? (todayIndex ?? null) : null))
    dives.current += 1
    setFocused(0)
    setMoved(false)
    setOpen(true)
    playMusic()
    // Fire-and-forget — the action itself checks who's logged in (only Nira
    // notifies Ken) and throttles itself, so it never delays the dive.
    notifyReasonTap().catch(() => {})
  }

  const closePortal = useCallback(() => {
    setOpen(false)
    pauseMusic()
    triggerRef.current?.focus()
  }, [pauseMusic])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePortal()
    }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, closePortal])

  const announced = portalOrder.length > 0 ? portalOrder[focused % portalOrder.length] : ''

  return (
    <div className="flex w-full flex-col items-center px-4 sm:px-0">
      <button
        ref={triggerRef}
        onClick={openPortal}
        className="tap-shrink group relative isolate inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-berry to-rose px-8 py-4 text-base font-semibold tracking-wide text-white shadow-xl shadow-berry/40 transition hover:shadow-2xl hover:shadow-berry/50 sm:text-lg"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-rose/60 blur-xl motion-safe:animate-pulse"
        />
        Fall into forever ✦
      </button>

      {mounted &&
        createPortal(
          // The music player lives here, invisible and untouchable.
          <div
            ref={setMusicHost}
            aria-hidden="true"
            className="pointer-events-none fixed bottom-0 left-0 -z-10 h-[220px] w-[220px] opacity-0"
          />,
          document.body,
        )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="portal"
                role="dialog"
                aria-modal="true"
                aria-label="Reasons I love you"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="fixed inset-0 z-[100] bg-[#0d0208] text-white"
              >
                <TunnelScene
                  order={portalOrder}
                  reduce={reduce}
                  controlsRef={controlsRef}
                  onFocusSlot={setFocused}
                  onFirstMove={() => setMoved(true)}
                />

                <button
                  ref={closeRef}
                  onClick={closePortal}
                  aria-label="Close"
                  className="absolute right-4 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition hover:bg-white/20"
                >
                  ✕
                </button>

                <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => controlsRef.current?.advance(1)}
                    className="flex flex-col items-center gap-1 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.3em] text-white/70"
                  >
                    {moved ? (
                      `№ ${focused + 1} · ∞`
                    ) : (
                      <>
                        Scroll to fall deeper
                        <motion.span
                          aria-hidden="true"
                          animate={reduce ? undefined : { y: [0, 6, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          ↓
                        </motion.span>
                      </>
                    )}
                  </button>

                  {!music.failed && (
                    <button
                      onClick={music.toggle}
                      aria-pressed={music.status !== 'off'}
                      className="flex items-center gap-2.5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
                    >
                      {music.status === 'off' ? 'Sound off' : 'Sound on'}
                      <Equalizer active={music.status === 'on'} />
                    </button>
                  )}
                </div>

                <p className="sr-only" aria-live="polite">
                  {announced}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}
