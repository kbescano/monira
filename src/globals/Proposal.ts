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
      name: 'loveLetter',
      type: 'textarea',
      label: 'Your love letter',
      admin: {
        description: 'Shown full-screen early in the sequence, right after her name.',
      },
    },
    {
      name: 'backgroundAudio',
      type: 'upload',
      relationTo: 'proposal-videos',
      label: 'Background song',
      admin: {
        description:
          'Plays continuously underneath your letter and your own video — upload it under "Proposal Media" like the videos. Pick something roughly the length of the letter (a few seconds per comma/period) plus your video, since there\'s no automatic timing to force it to end exactly on cue anymore.',
      },
    },
    {
      name: 'personalVideo',
      type: 'upload',
      relationTo: 'proposal-videos',
      label: 'Your own video message',
      admin: {
        description:
          'Plays right after the letter, before the family blessing videos — upload it under "Proposal Media" like the others.',
      },
    },
    {
      name: 'blessingsIntro',
      type: 'textarea',
      label: 'Intro before the family videos',
      admin: {
        description:
          'Shown phrase-by-phrase (same as your letter) right before the family blessing videos begin.',
      },
    },
    {
      name: 'secondAudio',
      type: 'upload',
      relationTo: 'proposal-videos',
      label: 'Second background song',
      admin: {
        description:
          'Starts the instant the first song stops — right as this intro appears — and plays quietly (5% volume) underneath the intro and the family videos, so it doesn\'t compete with them talking. Upload it under "Proposal Media" like the others.',
      },
    },
    {
      name: 'blessings',
      type: 'array',
      label: 'Family blessing videos',
      labels: { singular: 'Blessing', plural: 'Blessings' },
      admin: {
        description:
          'Plays back-to-back, in this order, right after your own video. Upload the videos themselves under "Blessing Videos" first.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Shown under their video, e.g. "Mom", "Dad", "Her sister Jen".' },
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'proposal-videos',
          required: true,
        },
      ],
    },
    {
      name: 'cueMessage',
      type: 'text',
      label: 'The very last line',
      defaultValue: 'Turn around.',
      admin: {
        description:
          'The final screen, right after the family videos, right before you propose in person — keep it short. Whatever fits how you\'ll actually be standing together in that moment.',
      },
    },
  ],
}
