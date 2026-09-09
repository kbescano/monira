import type { CollectionConfig } from 'payload'

export const VoiceNotes: CollectionConfig = {
  slug: 'voice-notes',
  labels: {
    singular: 'Voice Note',
    plural: 'Voice Notes',
  },
  upload: {
    staticDir: 'public/voice-notes',
    mimeTypes: ['audio/*'],
  },
  admin: {
    useAsTitle: 'filename',
    description: 'Voice recordings attached to letters. No length or size limit — clientUploads sends these straight to R2.',
  },
  access: {
    // Public read so the letter it's attached to can play it back.
    read: () => true,
    // Public create — anyone with the link can attach one from /letters.
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [],
}
