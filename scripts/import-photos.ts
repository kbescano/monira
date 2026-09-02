/**
 * Bulk-import a local folder of photos into the Memories collection.
 *
 * Each photo gets uploaded to Media (Cloudinary storage kicks in automatically)
 * and a linked Memories entry is created. Filenames matching the standard phone
 * camera pattern `IMG_YYYYMMDD_HHMMSS.jpg` get their date/time read straight from
 * the filename and used as `memoryDate`, and the title is formatted from that date.
 * Anything else falls back to today's date and the filename as the title.
 *
 * Titles/descriptions are placeholders — edit the real story in for each one via
 * /admin afterwards.
 *
 * Usage:
 *   bun run scripts/import-photos.ts <folder-of-images>
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const IMG_PATTERN = /^IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/i
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.gif'])

// This Cloudinary account rejects uploads over ~1 MiB with a misleading
// "Upload preset must be specified when using unsigned upload" error (confirmed
// by testing — re-encoding the same file smaller made the identical signed
// request succeed). Stay comfortably under that by re-compressing anything
// bigger, stepping quality down until it fits.
const MAX_UPLOAD_BYTES = 950_000

async function shrinkToFit(buffer: Buffer, mimetype: string): Promise<Buffer> {
  if (buffer.length <= MAX_UPLOAD_BYTES || mimetype !== 'image/jpeg') return buffer

  let quality = 85
  let out = buffer
  while (quality >= 40) {
    out = await sharp(buffer).jpeg({ quality }).toBuffer()
    if (out.length <= MAX_UPLOAD_BYTES) return out
    quality -= 15
  }

  // Quality alone wasn't enough (common for very high-resolution originals,
  // e.g. 3024x4032 full-res phone photos) — fall back to downscaling too.
  let width = 1800
  while (width >= 800) {
    out = await sharp(buffer).resize({ width, withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer()
    if (out.length <= MAX_UPLOAD_BYTES) return out
    width -= 400
  }
  return out
}

function mimeFor(ext: string) {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.heic':
      return 'image/heic'
    default:
      return 'application/octet-stream'
  }
}

function dateAndTitleFor(filename: string): { date: Date; title: string } {
  const match = filename.match(IMG_PATTERN)
  if (match) {
    const [, y, mo, d, h, mi, s] = match
    const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`)
    if (!Number.isNaN(date.getTime())) {
      const title = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      return { date, title }
    }
  }
  return { date: new Date(), title: path.parse(filename).name }
}

async function main() {
  const folder = process.argv[2]
  if (!folder) {
    console.error('Usage: bun run scripts/import-photos.ts <folder-of-images>')
    process.exit(1)
  }

  const dir = path.resolve(folder)
  const files = fs
    .readdirSync(dir)
    .filter((f) => VALID_EXT.has(path.extname(f).toLowerCase()))
    .sort()

  if (files.length === 0) {
    console.error(`No images found in ${dir}`)
    process.exit(1)
  }

  console.log(`Found ${files.length} image(s) in ${dir}. Connecting to Payload...`)
  const payload = await getPayload({ config })

  let created = 0
  for (const filename of files) {
    const filePath = path.join(dir, filename)
    const original = fs.readFileSync(filePath)
    const ext = path.extname(filename).toLowerCase()
    const mimetype = mimeFor(ext)
    const buffer = await shrinkToFit(original, mimetype)
    if (buffer.length !== original.length) {
      console.log(`  (shrunk ${filename}: ${original.length} -> ${buffer.length} bytes)`)
    }
    const { date, title } = dateAndTitleFor(filename)

    try {
      const media = await payload.create({
        collection: 'media',
        data: { alt: `Us — ${title}` },
        file: {
          data: buffer,
          mimetype,
          name: filename,
          size: buffer.length,
        },
      })

      await payload.create({
        collection: 'memories',
        data: {
          title,
          description: 'Tell the story behind this one 💭 (edit me in /admin)',
          image: media.id,
          memoryDate: date.toISOString(),
        },
      })

      created += 1
      console.log(`✓ ${filename} -> "${title}"`)
    } catch (err) {
      console.error(`✗ ${filename} failed:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`\nDone. Created ${created}/${files.length} memories.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
