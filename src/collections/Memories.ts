import type { CollectionConfig } from 'payload'

export const Memories: CollectionConfig = {
  slug: 'memories',
  labels: {
    singular: 'Memory',
    plural: 'Memories',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['image', 'title', 'uploadedBy', 'memoryDate'],
    description: 'Every card here shows up on the Memories page, newest first.',
  },
  defaultSort: '-memoryDate',
  access: {
    // Public read — this is what powers the Memories grid on the site.
    read: () => true,
    // Public create — anyone with the link can add a memory from /memories.
    // Editing/removing existing ones stays admin-only.
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const uploadedBy = doc.uploadedBy as string | undefined
        if (uploadedBy !== 'Ken' && uploadedBy !== 'Nira') return
        const forUser = uploadedBy === 'Ken' ? 'Nira' : 'Ken'
        try {
          await req.payload.create({
            collection: 'notifications',
            data: {
              message: `${uploadedBy} uploaded a photo`,
              forUser,
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "The day you said yes"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The little story behind the photo.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'memoryDate',
      type: 'date',
      label: 'Date this happened',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Used to order the memories — defaults to today if left blank.',
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'uploadedBy',
      type: 'select',
      options: [
        { label: 'Ken', value: 'Ken' },
        { label: 'Nira', value: 'Nira' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Who added this memory — powers the "X uploaded a photo" notification.',
      },
    },
  ],
}
