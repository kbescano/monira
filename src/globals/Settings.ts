import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site Settings',
  admin: {
    description:
      'Feature toggles for the site — turning one off hides that section without deleting its content.',
  },
  access: {
    // Public read — pages check these toggles on every request.
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // The moment either toggle flips off, stamp "now" as the cutoff —
        // anything created before this stays hidden until it's switched
        // back on; anything created *while* it's off (new letters/memories
        // people keep adding normally) still shows, since it falls after
        // the cutoff. Switching back on just stops applying the cutoff at
        // all, so old and new both reappear.
        if (data.showLetters === false && originalDoc?.showLetters !== false) {
          data.lettersHiddenAt = new Date().toISOString()
        }
        if (data.showMemories === false && originalDoc?.showMemories !== false) {
          data.memoriesHiddenAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'showReasons',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show "why I love you" reasons',
      admin: {
        description:
          'If off, the reasons button and section are hidden from the Home page — the reasons themselves stay saved in the Reasons collection.',
      },
    },
    {
      name: 'showLetters',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Letters',
      admin: {
        description:
          'Turning this off hides every letter that exists right now. Writing (or replying to) a letter still works as normal, and anything added while it\'s off stays visible. Turning it back on brings everything — old and new — back.',
      },
    },
    {
      name: 'lettersHiddenAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Set automatically the moment Show Letters is turned off. Not meant to be edited by hand.',
      },
    },
    {
      name: 'showMemories',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Memories',
      admin: {
        description:
          'Turning this off hides every memory that exists right now. Adding a new memory still works as normal, and anything added while it\'s off stays visible. Turning it back on brings everything — old and new — back.',
      },
    },
    {
      name: 'memoriesHiddenAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Set automatically the moment Show Memories is turned off. Not meant to be edited by hand.',
      },
    },
  ],
}
