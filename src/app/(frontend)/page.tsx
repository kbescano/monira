import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/session'
import { getViewOnceGateStatus } from '@/lib/viewOnceGate'
import FloatingHearts from './components/FloatingHearts'
import ProposalGate from './components/ProposalGate'
import type { ProposalContent } from './components/ProposalSequence'
import RunawayKiss from './components/RunawayKiss'
import TogetherCounter from './components/TogetherCounter'
import QuizGame from './components/QuizGame'
import ViewOnceGateNotice from './components/ViewOnceGateNotice'
import { hero, nav } from './content'

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

// Site-wide feature toggles — defaults to on/off as noted below if the
// global hasn't been touched yet (Payload lazily creates it, returning field
// defaults until someone actually saves it in /admin).
async function getSettings(): Promise<{ showReasons: boolean; proposalActive: boolean }> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'settings' })
    return {
      showReasons: settings.showReasons !== false,
      proposalActive: Boolean(settings.proposalActive),
    }
  } catch (error) {
    console.error('Failed to load site settings from Payload:', error)
    return { showReasons: true, proposalActive: false }
  }
}

const EMPTY_PROPOSAL: ProposalContent = {
  memoryPhotos: [],
  blessings: [],
  finalMessage: '',
  cueMessage: 'Turn around.',
}

// Only fetched while Proposal mode is actually on — no point querying
// Memories + the Proposal global on every single homepage load otherwise.
async function getProposalContent(): Promise<ProposalContent> {
  try {
    const payload = await getPayloadClient()
    const [proposal, memoriesResult] = await Promise.all([
      payload.findGlobal({ slug: 'proposal', depth: 1 }),
      payload.find({ collection: 'memories', depth: 1, sort: '-memoryDate', limit: 200 }),
    ])

    const memoryPhotos = memoriesResult.docs
      .map((doc) => {
        const image = doc.image as { url?: string | null; alt?: string | null } | number | null
        if (!image || typeof image !== 'object' || !image.url) return null
        return { url: image.url, alt: image.alt || (doc.title as string) || '' }
      })
      .filter((p): p is { url: string; alt: string } => p !== null)

    const blessings = (proposal.blessings ?? [])
      .map((b) => {
        const video = b.video as { url?: string | null } | number | null
        if (!video || typeof video !== 'object' || !video.url) return null
        return { name: b.name, videoUrl: video.url }
      })
      .filter((b): b is { name: string; videoUrl: string } => b !== null)

    return {
      memoryPhotos,
      blessings,
      finalMessage: proposal.finalMessage || '',
      cueMessage: proposal.cueMessage || 'Turn around.',
    }
  } catch (error) {
    console.error('Failed to load proposal content from Payload:', error)
    return EMPTY_PROPOSAL
  }
}

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  const [reasons, settings, gate] = await Promise.all([
    getReasons(),
    getSettings(),
    getViewOnceGateStatus(currentUser),
  ])
  const proposal = settings.proposalActive ? await getProposalContent() : EMPTY_PROPOSAL

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blush via-cream to-cream">
      <FloatingHearts />

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

        {/* Reason generator — heading and button always show; when the
            toggle is off we just pass an empty list, so tapping quietly
            shows nothing instead of the whole section disappearing. While
            Proposal mode is on, this same button launches the proposal
            sequence instead. Locked ahead of all that if the View Once gate
            says Nira still owes sends. */}
        {gate.locked ? (
          <ViewOnceGateNotice remaining={gate.remaining} />
        ) : (
          <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
            <h2 className="font-serif text-2xl text-berry sm:text-3xl">
              In case you forgot why I&apos;m obsessed with you
            </h2>
            <ProposalGate
              displayReasons={settings.showReasons ? reasons : []}
              proposalReasons={reasons}
              proposalActive={settings.proposalActive}
              proposal={proposal}
            />
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
    </div>
  )
}
