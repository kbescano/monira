import type { CollectionConfig } from 'payload'

export const Reasons: CollectionConfig = {
  slug: 'reasons',
  labels: {
    singular: 'Reason',
    plural: 'Reasons',
  },
  admin: {
    useAsTitle: 'text',
    description:
      'Powers the "why I love you" button on the Home page — shuffles through these at random.',
  },
  access: {
    // Public read — this is what powers the button on the Home page.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One reason. Mix serious and silly on purpose.',
      },
    },
  ],
}
