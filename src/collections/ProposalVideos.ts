import type { CollectionConfig } from 'payload'

export const ProposalVideos: CollectionConfig = {
  slug: 'proposal-videos',
  labels: {
    singular: 'Proposal Media',
    plural: 'Proposal Media',
  },
  upload: {
    staticDir: 'public/proposal-videos',
    mimeTypes: ['video/*', 'audio/*'],
  },
  admin: {
    useAsTitle: 'filename',
    description:
      'Videos and audio for the proposal sequence — family blessings, your own video, the background song. Upload here, then reference each one from the Proposal global.',
  },
  access: {
    // Public read — the proposal sequence needs to play these back for her.
    read: () => true,
    // Admin-only create/update/delete — unlike the rest of the site's media,
    // this is curated content only you add, not something either of you
    // uploads casually from the public pages.
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [],
}
