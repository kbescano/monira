import type { CollectionConfig } from 'payload'

export const ReunionAnswers: CollectionConfig = {
  slug: 'reunion-answers',
  labels: {
    singular: 'Reunion Answer',
    plural: 'Reunion Answers',
  },
  admin: {
    useAsTitle: 'kind',
    defaultColumns: ['kind', 'message', 'createdAt'],
    description:
      'Nira’s answers to “Do you want us back?”. A “yes” unlocks the site for her for good — delete it to ask her again. “Not yet” answers (and anything she wrote) are kept here, and also under /pact on the site.',
  },
  defaultSort: '-createdAt',
  access: {
    // Only ever written by the site's own server actions (Local API, which
    // bypasses these) — nothing here is reachable through the public REST API.
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Yes — she wants us back', value: 'yes' },
        { label: 'Not yet', value: 'not-yet' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      maxLength: 1200,
      admin: {
        description: 'What she wrote — why she’s not ready, or conditions she’d like to add.',
      },
    },
  ],
}
