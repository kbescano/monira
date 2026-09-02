import type { CollectionConfig } from 'payload'

export const LoveLetters: CollectionConfig = {
  slug: 'love-letters',
  labels: {
    singular: 'Love Letter',
    plural: 'Love Letters',
  },
  admin: {
    useAsTitle: 'to',
    defaultColumns: ['to', 'from', 'pinned', 'message', 'createdAt'],
    description: 'Every letter here shows up on the Letters feed — pinned ones float to the top.',
  },
  defaultSort: '-pinned,-createdAt',
  access: {
    // Public read — this is what powers the Letters feed on the site.
    read: () => true,
    // Public create — anyone with the link can write one from /letters.
    // Editing/removing existing ones stays admin-only.
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const to = doc.to as string | undefined
        if (to !== 'Ken' && to !== 'Nira') return
        const from = doc.from as string | undefined
        const who = from === 'Ken' || from === 'Nira' ? from : 'Someone'
        try {
          await req.payload.create({
            collection: 'notifications',
            data: {
              message: `${who} sent you a letter`,
              forUser: to,
              read: false,
            },
          })
        } catch (err) {
          req.payload.logger.error(err)
        }
      },
    ],
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
      name: 'from',
      type: 'select',
      options: [
        { label: 'Ken', value: 'Ken' },
        { label: 'Nira', value: 'Nira' },
      ],
      admin: {
        description: 'Who wrote it — set automatically from who was logged in.',
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
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
      // Field-level guard: even though `create` is public on this collection,
      // only an admin can set or change `pinned` — a public submitter's request
      // body can't sneak this in, it just falls back to the default (false).
      access: {
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
      },
      admin: {
        position: 'sidebar',
        description: 'Pin this letter to the top of the feed.',
      },
    },
  ],
}
