'use client'

import { useState } from 'react'
import ReasonGenerator from './ReasonGenerator'
import ProposalSequence, { type ProposalContent } from './ProposalSequence'

export default function ProposalGate({
  displayReasons,
  proposalReasons,
  proposalActive,
  proposal,
}: {
  // What the normal (non-proposal) button shows — already filtered by the
  // "Show reasons" toggle upstream.
  displayReasons: string[]
  // What the proposal's own reasons-montage step uses — deliberately the
  // full, unfiltered list, so turning "Show reasons" off elsewhere never
  // guts this step.
  proposalReasons: string[]
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
      {sequenceOpen && (
        <ProposalSequence
          reasons={proposalReasons}
          proposal={proposal}
          onDone={() => setSequenceOpen(false)}
        />
      )}
    </>
  )
}
