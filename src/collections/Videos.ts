import type { CollectionConfig } from 'payload'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: 'Vanishing Video',
    plural: 'Vanishing Videos',
  },
  upload: {
    staticDir: 'public/videos',
    mimeTypes: ['video/*', 'image/*'],
  },
  admin: {
    useAsTitle: 'caption',
    description:
      'Video or photo messages that delete themselves — Cloudinary asset included — the moment someone opens the watch link. Once it\'s gone from here, it\'s gone.',
  },
  defaultSort: '-createdAt',
  access: {
    // Public read so the watch page can look the doc up by id before deleting it.
    // There's no listing-by-browsing-around exposed anywhere except the /videos
    // feed, which only shows caption text, never the file itself.
    read: () => true,
    // Public create — anyone with the link can record/send one from /videos.
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    // Deletion also happens automatically (as the viewer) via the watch page's
    // own server action, using the Local API, which bypasses this — this only
    // gates manual deletes from /admin.
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const uploadedBy = doc.uploadedBy as string | undefined
        if (uploadedBy !== 'Ken' && uploadedBy !== 'Nira') return
        const forUser = uploadedBy === 'Ken' ? 'Nira' : 'Ken'
        const kindLabel = doc.kind === 'photo' ? 'photo' : 'video'
        try {
          await req.payload.create({
            collection: 'notifications',
            data: {
              message: `${uploadedBy} sent you a ${kindLabel}`,
              forUser,
              link: `/videos/${doc.id}`,
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
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'video',
      options: [
        { label: 'Video', value: 'video' },
        { label: 'Photo', value: 'photo' },
      ],
      admin: {
        position: 'sidebar',
        description: 'A quick tap on the shutter sends a photo — press and hold sends a video.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional — shown on the /videos list before it\'s watched.',
      },
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
        description:
          'Who sent it. The watch page only burns it when the *other* person opens it — the sender can preview their own without spending it.',
      },
    },
  ],
}
