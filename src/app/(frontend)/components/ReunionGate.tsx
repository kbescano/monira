'use client'

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import { logout } from '../login/actions'
import { nav, reunion } from '../content'
import { acceptReunion, declineReunion } from '../reunion/actions'
import Petals from './Petals'
import { Ornament } from './SectionHeading'
import SplitHeart from './SplitHeart'
import { BenefitCards, ConditionCards } from './TermsLists'

type Step = 'ask' | 'terms' | 'yes' | 'notyet' | 'sent'

const MAX_MESSAGE = 1200
const TONES = ['#d62850', '#ff6f91', '#c9184a', '#ff9bb0']

const PRIMARY =
  'tap-shrink w-full max-w-[19rem] rounded-full bg-gradient-to-r from-berry to-rose px-6 py-4 text-[15px] font-semibold text-white shadow-xl shadow-berry/40 transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'
const GHOST =
  'tap-shrink w-full max-w-[19rem] rounded-full border-[1.5px] border-berry/35 px-6 py-3.5 text-[15px] font-semibold text-berry transition hover:bg-berry/5 disabled:opacity-50'
const BACK = 'self-start py-1 text-[13px] font-medium text-plum/55 transition hover:text-plum'

function Burst() {
  const petals = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const dist = 70 + Math.random() * 140
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist * 0.8 + 34,
          rot: (Math.random() - 0.5) * 620,
          size: 8 + Math.random() * 9,
          tone: TONES[i % TONES.length],
          delay: Math.random() * 0.18,
        }
      }),
    [],
  )

  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 1, rotate: p.rot }}
          transition={{ duration: 1.7, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
          className="absolute block"
          style={{
            width: p.size,
            height: p.size * 1.15,
            background: p.tone,
            borderRadius: '150% 0 150% 0',
          }}
        />
      ))}
    </div>
  )
}

function Heart({
  healed,
  small = false,
  reduce,
  children,
}: {
  healed: boolean
  small?: boolean
  reduce: boolean
  children?: ReactNode
}) {
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative isolate mx-auto ${small ? 'w-24' : 'w-32'}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[230%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),rgba(239,228,247,0.45)_55%,transparent)]"
      />
      <SplitHeart
        healed={healed}
        instant={reduce}
        className="w-full drop-shadow-[0_18px_22px_rgba(201,24,74,0.38)]"
      />
      {children}
    </motion.div>
  )
}

/**
 * Shown to Nira, in place of everything else, until she answers "Do you want
 * us back?". Yes saves her answer and unlocks the site; Not yet lets her say
 * why, tells Ken, and logs her out (it comes back next time she logs in).
 */
export default function ReunionGate() {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false
  const scrollRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('ask')
  const [agreed, setAgreed] = useState(false)
  const [message, setMessage] = useState('')
  const [wrote, setWrote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [healed, setHealed] = useState(false)
  const [burst, setBurst] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [step])

  // The nav bars sit underneath this full-screen layer — keep them out of reach
  // of the keyboard and screen readers too, not just covered up.
  useEffect(() => {
    const covered = Array.from(document.querySelectorAll<HTMLElement>('body > header, body > nav'))
    covered.forEach((el) => {
      el.inert = true
    })
    return () => {
      covered.forEach((el) => {
        el.inert = false
      })
    }
  }, [])

  // The heart starts broken on the "yes" screen and mends a moment after it appears.
  useEffect(() => {
    if (step !== 'yes') return
    if (reduce) {
      setHealed(true)
      return
    }
    const timer = setTimeout(() => {
      setHealed(true)
      setBurst(true)
    }, 650)
    return () => clearTimeout(timer)
  }, [step, reduce])

  // After "not yet" is sent: a short pause so it doesn't feel abrupt, then log out.
  useEffect(() => {
    if (step !== 'sent') return
    if (countdown <= 0) {
      startTransition(async () => {
        await logout()
      })
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, countdown])

  const sayYes = () =>
    startTransition(async () => {
      setError(null)
      const result = await acceptReunion()
      if (result.ok) setStep('yes')
      else setError(result.error)
    })

  const sayNotYet = (withMessage: boolean) =>
    startTransition(async () => {
      setError(null)
      const text = withMessage ? message.trim() : ''
      const result = await declineReunion(text)
      if (result.ok) {
        setWrote(text.length > 0)
        setCountdown(3)
        setStep('sent')
      } else {
        setError(result.error)
      }
    })

  const goHome = () => startTransition(() => router.refresh())

  return (
    <div
      ref={scrollRef}
      role="dialog"
      aria-modal="true"
      aria-label={reunion.title}
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-gradient-to-b from-blush via-cream to-cream"
    >
      <Petals count={10} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_at_top,rgba(239,228,247,0.9),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col px-6 pb-12 pt-8 text-center">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          {step === 'ask' && (
            <>
              <p className="font-script text-xl text-berry/85">💌 {nav.brand}</p>
              <div className="my-auto flex flex-col items-center gap-4 py-6">
                <Heart healed={false} reduce={reduce} />
                <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-rose">
                  {reunion.eyebrow}
                </p>
                <h1 className="text-balance font-script text-5xl leading-[1.05] text-berry">
                  {reunion.title}
                </h1>
                <p className="max-w-[19rem] text-balance text-base leading-relaxed text-plum/80">
                  {reunion.lead}
                </p>
                <p className="font-serif text-[17px] italic text-berry">{reunion.leadAside}</p>
                <button onClick={() => setStep('terms')} className={`${PRIMARY} mt-2`}>
                  Read our terms →
                </button>
                <p className="max-w-[16rem] text-balance text-xs leading-relaxed text-plum/55">
                  {reunion.reassurance}
                </p>
              </div>
            </>
          )}

          {step === 'terms' && (
            <>
              <button onClick={() => setStep('ask')} className={BACK}>
                ← Back
              </button>
              <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-rose">
                Read this first
              </p>
              <h2 className="mt-1.5 font-serif text-3xl font-semibold text-berry">
                Terms &amp; Conditions
              </h2>
              <p className="font-serif text-[15px] italic text-plum/55">(the sweet kind)</p>
              <Ornament className="justify-center" />
              <p className="mx-auto max-w-[18rem] text-balance text-[14.5px] leading-relaxed text-plum/80">
                {reunion.termsIntro}
              </p>

              <section className="mt-8">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-rose">
                  Part one
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-berry">The benefits</h3>
                <p className="mb-3.5 text-[13px] text-plum/55">Mine to give.</p>
                <BenefitCards />
              </section>

              <section className="mt-8">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-rose">
                  Part two
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-berry">
                  The conditions
                </h3>
                <p className="mb-3.5 text-[13px] text-plum/55">What we both promise.</p>
                <ConditionCards />
              </section>

              <div className="mt-8 flex flex-col items-center">
                <Ornament />
                <p className="font-script text-4xl text-berry">{reunion.signature}</p>
              </div>

              <div className="mt-7 grid justify-items-center gap-3 rounded-3xl border border-rose/30 bg-white/85 px-4 py-5 shadow-xl shadow-berry/10">
                <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-plum">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="h-[18px] w-[18px] accent-berry"
                  />
                  I’ve read everything above.
                </label>
                <button onClick={sayYes} disabled={!agreed || pending} className={PRIMARY}>
                  {pending ? 'One moment…' : 'Yes — I want us back 💕'}
                </button>
                <button onClick={() => setStep('notyet')} disabled={pending} className={GHOST}>
                  Not yet
                </button>
                {error && (
                  <p role="alert" className="text-sm text-berry">
                    {error}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 'yes' && (
            <div className="my-auto flex flex-col items-center gap-4 py-6">
              <Heart healed={healed} reduce={reduce}>
                {burst && <Burst />}
              </Heart>
              <h1 className="mt-3 text-balance font-script text-6xl leading-[1.05] text-berry">
                Welcome back, us.
              </h1>
              <p className="text-base text-plum/80">Ken’s been told. 💕</p>
              <p className="max-w-[16rem] text-balance text-xs leading-relaxed text-plum/55">
                These terms will live on your front page, so we never forget what we promised each
                other.
              </p>
              <button onClick={goHome} disabled={pending} className={`${PRIMARY} mt-2`}>
                {pending ? '…' : 'Take me home →'}
              </button>
            </div>
          )}

          {step === 'notyet' && (
            <>
              <button onClick={() => setStep('terms')} className={BACK}>
                ← Back to the terms
              </button>
              <div className="mt-3">
                <Heart healed={false} small reduce={reduce} />
              </div>
              <p className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-rose">
                That’s okay
              </p>
              <h2 className="mb-2.5 mt-2 text-balance font-serif text-[26px] font-semibold leading-tight text-berry">
                Tell me what’s on your heart.
              </h2>
              <p className="mb-4 text-balance text-[14.5px] leading-relaxed text-plum/80">
                Why you’re not ready — or anything you’d change or add to the terms. I’ll read every
                word.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_MESSAGE}
                rows={6}
                aria-label="Your message to Ken"
                placeholder={'I’m not ready because…\n\nI’d also like us to…'}
                className="min-h-[150px] w-full resize-none rounded-2xl border-[1.5px] border-rose/35 bg-white/85 px-4 py-3.5 text-left text-[15px] leading-normal text-plum outline-none transition placeholder:text-plum/40 focus:border-rose focus:ring-4 focus:ring-rose/20"
              />
              <p className="mb-4 mt-1 pr-1 text-right text-[11px] text-plum/40">
                {message.length} / {MAX_MESSAGE}
              </p>
              <div className="grid justify-items-center gap-2.5">
                <button
                  onClick={() => sayNotYet(true)}
                  disabled={!message.trim() || pending}
                  className={PRIMARY}
                >
                  {pending ? 'Sending…' : 'Send to Ken & log out'}
                </button>
                <button onClick={() => sayNotYet(false)} disabled={pending} className={GHOST}>
                  Log out without writing
                </button>
              </div>
              {error && (
                <p role="alert" className="mt-3 text-sm text-berry">
                  {error}
                </p>
              )}
              <p className="mt-4 text-balance text-xs leading-relaxed text-plum/55">
                Ken will be notified. This will be waiting the next time you log in — no rush.
              </p>
            </>
          )}

          {step === 'sent' && (
            <div className="my-auto flex flex-col items-center gap-3 py-6">
              <span className="text-5xl">💌</span>
              <h2 className="font-serif text-[28px] font-semibold text-berry">
                {wrote ? 'Sent.' : 'Noted.'}
              </h2>
              <p className="max-w-[17rem] text-balance text-base leading-relaxed text-plum/80">
                {wrote
                  ? 'Ken’s been notified, with your message.'
                  : 'Ken’s been notified that you’re not ready yet.'}{' '}
                {countdown > 0 ? `Logging you out in ${countdown}…` : 'Logging you out…'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
