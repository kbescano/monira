import type { CollectionConfig } from 'payload'

export const VoiceNotes: CollectionConfig = {
  slug: 'voice-notes',
  labels: {
    singular: 'Voice Note',
    plural: 'Voice Notes',
  },
  upload: {
    staticDir: 'public/voice-notes',
    // Browsers record audio through MediaRecorder into a webm or mp4
    // *container* — Payload sniffs the actual bytes rather than trusting the
    // declared Content-Type, and generic container sniffing can't tell an
    // audio-only track from a video one, so it reports these as video/webm
    // or video/mp4 even though there's no video in them. video/* has to be
    // allowed here for that reason, not because real video is expected.
    mimeTypes: ['audio/*', 'video/*'],
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
