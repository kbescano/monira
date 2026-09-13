'use client'

import { useState } from 'react'
import ReasonGenerator from './ReasonGenerator'
import ProposalSequence, { type ProposalContent } from './ProposalSequence'

export default function ProposalGate({
  displayReasons,
  proposalActive,
  proposal,
}: {
  // What the normal (non-proposal) button shows — already filtered by the
  // "Show reasons" toggle upstream.
  displayReasons: string[]
  proposalActive: boolean
  proposal: ProposalContent
}) {
  const [sequenceOpen, setSequenceOpen] = useState(false)

  return (
    <>
      <ReasonGenerator
        reasons={displayReasons}
        proposalActive={proposalActive}
        onStartProposal={() => setSequenceOpen(true)}
      />
      {sequenceOpen && <ProposalSequence proposal={proposal} onDone={() => setSequenceOpen(false)} />}
    </>
  )
}
