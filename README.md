# Love Notes 💌

A tiny, two-page romantic site:

- **Home** — an interactive, funny-but-romantic landing page (floating hearts, a "why I love you" reason generator, a runaway kiss button, a live "time together" counter).
- **Memories** — an Instagram-style photo grid. Each memory has a title, description, and image, managed through the Payload admin dashboard.

Built with Next.js 15, Payload CMS 3, Postgres (Neon), image hosting via Cloudinary, and deployed on Vercel.

## 1. Personalize it

Everything text-wise lives in one file: [`src/app/(frontend)/content.ts`](src/app/(frontend)/content.ts). Edit `herName`, `togetherSince`, `reasons`, `caughtMessages`, etc. No other files need to change.

## 2. Set up your services

You'll need free accounts with each of these (create them yourself in your browser — sign-ups aren't something I can do for you):

1. **[Neon](https://neon.tech)** — create a project, then copy the **pooled connection string** from the dashboard.
2. **[Cloudinary](https://cloudinary.com)** — from the dashboard home, grab your **Cloud name**, **API key**, and **API secret**.
3. **[Vercel](https://vercel.com)** — for deployment (step 5).

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Generate a `PAYLOAD_SECRET` with:

```bash
openssl rand -base64 32
```

## 3. Install & run locally

```bash
bun install
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the site, and [http://localhost:3000/admin](http://localhost:3000/admin) to create your first admin login and start adding memories (title, description, photo).

## 4. Add memories

Log into `/admin` → **Memories** → **Create New**. Upload a photo (it's stored on Cloudinary automatically), write a title + description, and it shows up on the `/memories` page immediately, newest first.

## 5. Deploy to Vercel

```bash
vercel
```

Or connect the GitHub repo in the Vercel dashboard. Either way, add the same environment variables from your `.env` (`DATABASE_URI`, `PAYLOAD_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) in the Vercel project's **Settings → Environment Variables**.

Once it's live, update the Vercel domain in [`next.config.mjs`](next.config.mjs) (`images.remotePatterns`) if you use a custom domain.

## Project structure

```
src/
├── app/
│   ├── (frontend)/          # Home + Memories pages, components, content.ts
│   └── (payload)/           # Payload admin routes (generated, don't edit)
├── collections/              # Users, Media, Memories (Payload schema)
├── lib/payload.ts            # Local API helper for server components
└── payload.config.ts         # Main Payload config (db, storage, collections)
```
