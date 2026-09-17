import type { GlobalConfig } from 'payload'

export const Proposal: GlobalConfig = {
  slug: 'proposal',
  label: 'Proposal',
  admin: {
    description:
      'Content for the proposal sequence. Turn it on with "Proposal mode" under Site Settings once everything here is filled in — you can preview the whole thing yourself first, nothing here is used up by watching it.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'personalVideo',
      type: 'upload',
      relationTo: 'proposal-videos',
      label: 'Your video',
      admin: {
        description:
          'Plays right after her name appears — upload it under "Proposal Media". Closes itself the moment it ends, back to the page underneath.',
      },
    },
  ],
}
