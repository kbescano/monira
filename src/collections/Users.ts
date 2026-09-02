import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Keep this a private, admin-only login — nobody else needs an account here.
    // Payload special-cases the very first user: when this collection is empty,
    // the admin panel's "create first user" screen bypasses access control,
    // so locking `create` down to existing admins doesn't block initial setup.
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [],
}
