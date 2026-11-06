import { getPayloadClient } from '@/lib/payload'
import type { ProposalContent } from '../components/ProposalSequence'

const EMPTY_PROPOSAL: ProposalContent = {
  personalVideoUrl: null,
}

export async function getProposalContent(): Promise<ProposalContent> {
  try {
    const payload = await getPayloadClient()
    const proposal = await payload.findGlobal({ slug: 'proposal', depth: 1 })

    const personalVideo = proposal.personalVideo as { url?: string | null } | number | null
    const personalVideoUrl =
      (personalVideo && typeof personalVideo === 'object' && personalVideo.url) || null

    return { personalVideoUrl }
  } catch (error) {
    console.error('Failed to load proposal content from Payload:', error)
    return EMPTY_PROPOSAL
  }
}
