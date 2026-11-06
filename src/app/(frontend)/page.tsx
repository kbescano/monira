import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser, isGuestSession } from '@/lib/session'
import { getViewOnceGateStatus } from '@/lib/viewOnceGate'
import GuestPrivateOverlay from './components/GuestPrivateOverlay'
import HeroPhotos, { type HeroPhoto } from './components/HeroPhotos'
import Petals from './components/Petals'
import ProposalReplay from './components/ProposalReplay'
import QuizGame from './components/QuizGame'
import ReasonGenerator from './components/ReasonGenerator'
import Reveal from './components/Reveal'
import RunawayKiss from './components/RunawayKiss'
import SectionHeading, { Ornament } from './components/SectionHeading'
import TogetherCounter from './components/TogetherCounter'
import ViewOnceGateNotice from './components/ViewOnceGateNotice'
import { apartSince, hero, nav, saidYesAt, signOff } from './content'
import { getProposalContent } from './lib/proposal'

export const dynamic = 'force-dynamic'

type HomeSettings = {
  showReasons: boolean
  showMemories: boolean
  memoriesHiddenAt: string | null
}

// Site-wide feature toggles — default to on if the global hasn't been
// touched yet (Payload lazily creates it, returning field defaults until
// someone actually saves it in /admin).
async function getSettings(): Promise<HomeSettings> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'settings' })
    return {
      showReasons: settings.showReasons !== false,
      showMemories: settings.showMemories !== false,
      memoriesHiddenAt: settings.memoriesHiddenAt ?? null,
    }
  } catch (error) {
    console.error('Failed to load site settings from Payload:', error)
    return { showReasons: true, showMemories: true, memoriesHiddenAt: null }
  }
}

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
    // Fail soft — the heart just has nothing to show if the list can't load.
    console.error('Failed to load reasons from Payload:', error)
    return []
  }
}

// The newest few memories for the hero — follows the same "Show Memories off
// hides what existed at that moment" rule as the Memories page itself.
async function getHeroPhotos(settings: HomeSettings): Promise<HeroPhoto[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'memories',
      depth: 1,
      sort: '-memoryDate',
      limit: 3,
      where: settings.showMemories
        ? undefined
        : { createdAt: { greater_than: settings.memoriesHiddenAt || new Date().toISOString() } },
    })

    return docs.flatMap((doc) => {
      const image = doc.image
      if (!image || typeof image !== 'object' || !image.url) return []
      return [{ id: String(doc.id), url: image.url, alt: image.alt || (doc.title as string) }]
    })
  } catch (error) {
    console.error('Failed to load hero photos from Payload:', error)
    return []
  }
}

// One reason per day (Manila time), the same for both of them. Stepping by a
// prime keeps consecutive days from walking the list in order.
function reasonOfTheDay(length: number): number | null {
  if (length === 0) return null
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .split('-')
    .map(Number)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
  return (dayNumber * 7919) % length
}

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  const [settings, gate, isGuest] = await Promise.all([
    getSettings(),
    getViewOnceGateStatus(currentUser),
    isGuestSession(),
  ])

  // The guest sees this page blurred and inert, so there's no reason to send
  // them any of the private content in the first place.
  const showPrivate = !isGuest
  const [reasons, photos, proposal] = await Promise.all([
    showPrivate && settings.showReasons && !gate.locked ? getReasons() : [],
    showPrivate && !gate.locked ? getHeroPhotos(settings) : [],
    showPrivate ? getProposalContent() : { personalVideoUrl: null },
  ])

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blush via-cream to-cream">
      <Petals />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(ellipse_at_top,rgba(239,228,247,0.85),transparent_70%)]"
      />

      <GuestPrivateOverlay isGuest={isGuest}>
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-16 px-0 pb-24 pt-14 text-center sm:px-6 sm:pt-20">
          {/* Hero */}
          <Reveal className="flex w-full flex-col items-center gap-4 px-4 sm:px-0">
            <span className="text-sm font-medium uppercase tracking-widest text-rose">
              {hero.eyebrow}
            </span>
            <h1 className="font-script text-5xl leading-tight text-berry sm:text-6xl">
              {hero.title}
            </h1>
            <p className="max-w-md text-base text-plum/80 sm:text-lg">{hero.subtitle}</p>
            <HeroPhotos photos={photos} />
          </Reveal>

          {/* Counters — the long one big, the two recent ones tucked side by side */}
          <Reveal className="flex w-full flex-col items-center gap-9 px-4 sm:px-0">
            <TogetherCounter />
            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              <TogetherCounter
                variant="sm"
                since={saidYesAt}
                title="Since you said yes 💍"
                footnote="(still can't stop smiling)"
              />
              <TogetherCounter
                variant="sm"
                since={apartSince}
                title="Time we've been apart"
                footnote="(closer to you every second)"
              />
            </div>
          </Reveal>

          {/* Reasons — an endless fall through a heart-shaped tunnel (see
              ReasonGenerator). Locked ahead of all that if the View Once gate
              says Nira still owes sends, and left out entirely when there's
              nothing to show (toggle off, or the guest, who gets none). */}
          {gate.locked ? (
            <ViewOnceGateNotice remaining={gate.remaining} />
          ) : (
            reasons.length > 0 && (
              <Reveal className="flex w-full flex-col items-center gap-6">
                <SectionHeading
                  eyebrow="Reasons"
                  title="In case you forgot why I'm obsessed with you"
                />
                <ReasonGenerator reasons={reasons} todayIndex={reasonOfTheDay(reasons.length)} />
              </Reveal>
            )
          )}

          {/* Quiz */}
          <Reveal className="flex w-full flex-col items-center gap-6 px-4 sm:px-0">
            <SectionHeading eyebrow="Quiz" title="How well do you know us?" />
            <QuizGame />
          </Reveal>

          {/* Runaway kiss game */}
          <Reveal className="flex w-full flex-col items-center gap-6 px-4 sm:px-0">
            <SectionHeading eyebrow="One more thing" title="Before you go" />
            <RunawayKiss />
          </Reveal>

          {/* Proof + proposal. ProposalReplay sits outside any Reveal wrapper
              because its full-screen player is position:fixed. */}
          <div className="flex w-full flex-col items-center gap-6 px-4 sm:px-0">
            <Reveal>
              <SectionHeading eyebrow="Proof" title="Want proof this isn't all talk?" />
            </Reveal>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/memories"
                className="tap-shrink rounded-full border-2 border-berry px-6 py-3 text-sm font-semibold text-berry transition hover:bg-berry hover:text-white sm:text-base"
              >
                See our {nav.memories.toLowerCase()} →
              </Link>
              <ProposalReplay proposal={proposal} className="flex items-center" />
            </div>
          </div>

          {/* Sign-off */}
          <Reveal className="flex flex-col items-center gap-3">
            <Ornament />
            <p className="font-script text-3xl text-berry">{signOff}</p>
          </Reveal>
        </div>
      </GuestPrivateOverlay>
    </div>
  )
}
