import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    // Local fallback dir — Cloudinary storage takes over actual hosting.
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        position: 'centre',
      },
      {
        name: 'card',
        width: 900,
        height: 900,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    // Public read so the site can render photos for both of you.
    read: () => true,
    // Public create — anyone with the link can contribute a photo from /memories.
    // Editing/removing existing ones stays admin-only.
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Short description for accessibility (e.g. "Us at the beach, 2024").',
      },
    },
    {
      // Read-only pointer at the old Cloudinary URL — this isn't the active
      // storage adapter anymore (that's R2 now), but the column still holds
      // real data for every photo uploaded before the move, and the frontend
      // reads this first before falling back to the R2-backed `url` field.
      // Without declaring it here, Payload won't return the column at all,
      // even though it's still sitting in the DB.
      name: 'cloudinary',
      type: 'group',
      admin: {
        position: 'sidebar',
        description: 'Legacy Cloudinary reference for photos uploaded before the move to R2.',
      },
      fields: [
        {
          name: 'secure_url',
          type: 'text',
          admin: { readOnly: true },
        },
      ],
    },
  ],
}
