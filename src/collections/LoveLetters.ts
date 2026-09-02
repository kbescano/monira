import type { CollectionConfig } from 'payload'

export const LoveLetters: CollectionConfig = {
  slug: 'love-letters',
  labels: {
    singular: 'Love Letter',
    plural: 'Love Letters',
  },
  admin: {
    useAsTitle: 'to',
    defaultColumns: ['to', 'message', 'createdAt'],
    description: 'Every letter here shows up on the Letters feed, newest first.',
  },
  defaultSort: '-createdAt',
  access: {
    // Public read — this is what powers the Letters feed on the site.
    read: () => true,
    // Public create — anyone with the link can write one from /letters.
    // Editing/removing existing ones stays admin-only.
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'to',
      type: 'select',
      required: true,
      options: [
        { label: 'Ken', value: 'Ken' },
        { label: 'Nira', value: 'Nira' },
      ],
      admin: {
        description: 'Who this letter is for.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The letter itself.',
      },
    },
  ],
}
