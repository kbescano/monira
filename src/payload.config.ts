import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Memories } from './collections/Memories'
import { LoveLetters } from './collections/LoveLetters'
import { Reasons } from './collections/Reasons'
import { Videos } from './collections/Videos'
import { Notifications } from './collections/Notifications'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Love Nira always',
    },
  },
  sharp,
  collections: [Users, Media, Memories, LoveLetters, Reasons, Videos, Notifications],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  plugins: [
    // Cloudflare R2 — S3-compatible, no built-in content moderation like
    // Cloudinary's. The bucket stays private; files are only ever reached
    // through this app's own authenticated API routes (no public bucket URL
    // configured below), same as local storage would behave.
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: process.env.R2_ENDPOINT || '',
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
    // Videos gets its own instance with clientUploads on: recordings can run
    // up to 100MB, and Vercel serverless functions cap an incoming request
    // body around 4.5MB regardless of anything configured here. clientUploads
    // has the browser PUT the file straight to R2 with a presigned URL —
    // bypassing that cap entirely — then hands Payload just the small JSON
    // needed to register the doc. `access: () => true` matches this
    // collection's own public-create policy (already gated by the site-wide
    // login at the middleware level).
    s3Storage({
      collections: {
        videos: true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: process.env.R2_ENDPOINT || '',
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
      clientUploads: {
        access: () => true,
      },
    }),
  ],
})
