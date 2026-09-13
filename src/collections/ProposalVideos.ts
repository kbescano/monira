import type { CollectionConfig } from 'payload'

export const ProposalVideos: CollectionConfig = {
  slug: 'proposal-videos',
  labels: {
    singular: 'Blessing Video',
    plural: 'Blessing Videos',
  },
  upload: {
    staticDir: 'public/proposal-videos',
    mimeTypes: ['video/*'],
  },
  admin: {
    useAsTitle: 'filename',
    description:
      'Family blessing videos for the proposal sequence. Upload here, then add each one to the "blessings" list on the Proposal global, in the order they should play.',
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
