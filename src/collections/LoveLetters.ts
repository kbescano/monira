import type { CollectionConfig } from 'payload'

export const LoveLetters: CollectionConfig = {
  slug: 'love-letters',
  labels: {
    singular: 'Love Letter',
    plural: 'Love Letters',
  },
  admin: {
    useAsTitle: 'to',
    defaultColumns: ['to', 'from', 'pinned', 'message', 'replyTo', 'createdAt'],
    description:
      'Every top-level letter here shows up on the Letters feed, newest first. Replies (replyTo set) show up inside that letter\'s thread instead. Pinned letters stay in feed order — pinning only affects the "view pinned" modal.',
  },
  defaultSort: '-createdAt',
  access: {
    // Public read — this is what powers the Letters feed and threads on the site.
    read: () => true,
    // Public create — anyone with the link can write one from /letters.
    // Editing/removing existing ones stays admin-only.
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation !== 'create' || !data) return data
        const hasMessage = typeof data.message === 'string' && data.message.trim().length > 0
        const hasVoiceNote = Boolean(data.voiceNote)
        const isHeart = data.heart === true
        if (!hasMessage && !hasVoiceNote && !isHeart) {
          throw new Error('A letter needs a message, a voice note, or a heart.')
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const to = doc.to as string | undefined
        if (to !== 'Ken' && to !== 'Nira') return
        const from = doc.from as string | undefined
        const who = from === 'Ken' || from === 'Nira' ? from : 'Someone'
        const hasVoiceNote = Boolean(doc.voiceNote)
        const hasMessage = typeof doc.message === 'string' && doc.message.trim().length > 0
        const isReply = Boolean(doc.replyTo)
        const replyToId = typeof doc.replyTo === 'object' ? doc.replyTo?.id : doc.replyTo
        const link = isReply ? `/letters/${replyToId}` : '/letters'

        let message: string
        if (doc.heart) {
          message = isReply ? `${who} sent a ❤️ in your letter` : `${who} sent you a ❤️`
        } else if (hasVoiceNote && !hasMessage) {
          message = isReply ? `${who} replied with a voice note` : `${who} sent you a voice note`
        } else {
          message = isReply ? `${who} replied to your letter` : `${who} sent you a letter`
        }

        try {
          await req.payload.create({
            collection: 'notifications',
            data: { message, forUser: to, read: false, link },
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
      // Not required at the field level — a letter can be voice-only or a
      // bare heart. beforeValidate above enforces "at least one of the three".
      admin: {
        description: 'The letter itself. Optional if a voice note or heart is attached.',
      },
    },
    {
      name: 'voiceNote',
      type: 'upload',
      relationTo: 'voice-notes',
      admin: {
        description: 'Optional spoken letter — no length or size limit.',
      },
    },
    {
      name: 'heart',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Legacy — a bare heart sent as its own reply. No longer created by the app (hearting is now a per-message reaction via heartedBy below), kept only so old heart-replies still render.',
      },
    },
    {
      name: 'heartedBy',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Ken', value: 'Ken' },
        { label: 'Nira', value: 'Nira' },
      ],
      admin: {
        description:
          'Who has hearted this specific letter or reply — toggled from the ❤️ next to it. At most one entry per person.',
      },
    },
    {
      name: 'replyTo',
      type: 'relationship',
      relationTo: 'love-letters',
      admin: {
        description:
          'Set only on replies — always points at the top-level letter that started the thread, so threads stay one level deep.',
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
