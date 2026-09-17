'use client'

import { useState } from 'react'
import ProposalSequence, { type ProposalContent } from './ProposalSequence'

export default function ProposalReplay({ proposal }: { proposal: ProposalContent }) {
  const [open, setOpen] = useState(false)

  // Nothing worth replaying if the video was never filled in — stay
  // invisible rather than offering an empty playback.
  if (!proposal.personalVideoUrl) return null

  return (
    <>
      <div className="flex flex-col items-center gap-2 px-4 pb-2 pt-6 text-center sm:px-0">
        <button
          onClick={() => setOpen(true)}
          className="tap-shrink flex items-center gap-2 rounded-full bg-berry px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-berry/30 transition hover:bg-plum sm:text-base"
        >
          💍 Watch our proposal
        </button>
      </div>
      {open && <ProposalSequence proposal={proposal} onDone={() => setOpen(false)} />}
    </>
  )
}
