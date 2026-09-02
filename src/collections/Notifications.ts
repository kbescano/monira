import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  labels: {
    singular: 'Notification',
    plural: 'Notifications',
  },
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['message', 'forUser', 'read', 'createdAt'],
    description:
      'Auto-created when a letter arrives or a photo is uploaded. The bell only shows the last 24 hours.',
  },
  defaultSort: '-createdAt',
  access: {
    // Public read/create/update — same trust level as the rest of the site
    // (already gated behind the daily-password login). The bell reads/writes
    // these directly from the client, no admin account needed.
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'message',
      type: 'text',
      required: true,
    },
    {
      name: 'forUser',
      type: 'select',
      required: true,
      options: [
        { label: 'Ken', value: 'Ken' },
        { label: 'Nira', value: 'Nira' },
      ],
      admin: {
        description: 'Who this notification is for.',
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'Where tapping this notification goes — a relative path like /videos/123.',
      },
    },
  ],
}
