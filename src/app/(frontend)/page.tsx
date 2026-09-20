import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser, isGuestSession } from '@/lib/session'
import { getViewOnceGateStatus } from '@/lib/viewOnceGate'
import FloatingHearts from './components/FloatingHearts'
import GuestPrivateOverlay from './components/GuestPrivateOverlay'
import ReasonGenerator from './components/ReasonGenerator'
import RunawayKiss from './components/RunawayKiss'
import TogetherCounter from './components/TogetherCounter'
import QuizGame from './components/QuizGame'
import ViewOnceGateNotice from './components/ViewOnceGateNotice'
import { apartSince, hero, nav, saidYesAt } from './content'

export const dynamic = 'force-dynamic'

async function getReasons(): Promise<string[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'reasons',
      sort: '-createdAt',
      limit: 500,
    })
    return docs.map((doc) => doc.text as string).filter(Boolean)
  } catch (error) {
    // Fail soft — the button just hides itself if the list can't load.
    console.error('Failed to load reasons from Payload:', error)
    return []
  }
}

// Site-wide feature toggles — defaults to on if the global hasn't been
// touched yet (Payload lazily creates it, returning field defaults until
// someone actually saves it in /admin).
async function getShowReasons(): Promise<boolean> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'settings' })
    return settings.showReasons !== false
  } catch (error) {
    console.error('Failed to load site settings from Payload:', error)
    return true
  }
}

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  const [reasons, showReasons, gate, isGuest] = await Promise.all([
    getReasons(),
    getShowReasons(),
    getViewOnceGateStatus(currentUser),
    isGuestSession(),
  ])

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blush via-cream to-cream">
      <FloatingHearts />

      <GuestPrivateOverlay isGuest={isGuest}>
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-14 px-0 pb-24 pt-16 text-center sm:px-6 sm:pt-24">
          {/* Hero */}
          <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
            <span className="text-sm font-medium uppercase tracking-widest text-rose">
              {hero.eyebrow}
            </span>
            <h1 className="font-script text-5xl leading-tight text-berry sm:text-6xl">
              {hero.title}
            </h1>
            <p className="max-w-md text-base text-plum/80 sm:text-lg">{hero.subtitle}</p>
          </div>

          {/* Days together counter */}
          <TogetherCounter />

          {/* Since she said yes */}
          <TogetherCounter
            since={saidYesAt}
            title="Since you said yes 💍"
            footnote="(still can't stop smiling)"
          />

          {/* Apart counter */}
          <TogetherCounter
            since={apartSince}
            title="Time we've been apart:"
            footnote="(every second is one closer to seeing you again)"
          />

          {/* Reason generator — heading and button always show, for guest too;
            when the toggle is off we just pass an empty list, so tapping
            quietly shows nothing instead of the whole section disappearing.
            For a guest specifically, tapping reveals a restriction message
            instead of a real reason — see ReasonGenerator's isGuest handling.
            Locked ahead of all that if the View Once gate says Nira still
            owes sends. */}
          {gate.locked ? (
            <ViewOnceGateNotice remaining={gate.remaining} />
          ) : (
            <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
              <h2 className="font-serif text-2xl text-berry sm:text-3xl">
                In case you forgot why I&apos;m obsessed with you
              </h2>
              <ReasonGenerator reasons={showReasons ? reasons : []} isGuest={isGuest} />
            </div>
          )}

          {/* Quiz */}
          <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
            <h2 className="font-serif text-2xl text-berry sm:text-3xl">How well do you know us?</h2>
            <QuizGame />
          </div>

          {/* Runaway kiss game */}
          <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
            <h2 className="font-serif text-2xl text-berry sm:text-3xl">
              One more thing before you go
            </h2>
            <RunawayKiss />
          </div>

          {/* CTA to memories */}
          <div className="flex flex-col items-center gap-3 px-4 sm:px-0">
            <p className="text-plum/70">Want proof this isn&apos;t all talk?</p>
            <Link
              href="/memories"
              className="tap-shrink rounded-full border-2 border-berry px-6 py-3 text-base font-semibold text-berry transition hover:bg-berry hover:text-white"
            >
              See our {nav.memories.toLowerCase()} →
            </Link>
          </div>
        </div>
      </GuestPrivateOverlay>
    </div>
  )
}
