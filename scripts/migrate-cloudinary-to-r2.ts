/**
 * One-time migration: re-hosts every existing Media doc's file from Cloudinary
 * onto Cloudflare R2 (now the active storage adapter — see payload.config.ts).
 *
 * Reads from a local backup snapshot of each doc's `cloudinary_secure_url`
 * (taken directly via psql before the Cloudinary plugin was removed from the
 * config, since a dev-mode schema push would otherwise drop those columns).
 * Downloads each original from Cloudinary's CDN, then re-uploads the same
 * bytes to the *same* doc id via the Local API — this re-triggers the R2
 * storage adapter and regenerates the thumbnail/card sizes, without touching
 * any Memories relation (they point at the doc id, which never changes).
 *
 * Usage:
 *   bun run scripts/migrate-cloudinary-to-r2.ts <path-to-backup.json>
 */
import 'dotenv/config'
import fs from 'fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

type BackupRow = {
  id: number
  alt: string
  cloudinary_secure_url: string | null
  mime_type: string | null
  filename: string | null
}

async function main() {
  const backupPath = process.argv[2]
  if (!backupPath) {
    console.error('Usage: bun run scripts/migrate-cloudinary-to-r2.ts <path-to-backup.json>')
    process.exit(1)
  }

  const rows: BackupRow[] = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))
  console.log(`Loaded ${rows.length} row(s) from backup.`)

  const payload = await getPayload({ config })

  let migrated = 0
  let skipped = 0
  const failures: { id: number; filename: string | null; error: string }[] = []

  for (const row of rows) {
    if (!row.cloudinary_secure_url) {
      skipped += 1
      continue
    }

    try {
      const res = await fetch(row.cloudinary_secure_url)
      if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`)
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const filename = row.filename || `media-${row.id}.jpg`
      const mimetype = row.mime_type || 'image/jpeg'

      await payload.update({
        collection: 'media',
        id: row.id,
        data: {},
        file: {
          data: buffer,
          mimetype,
          name: filename,
          size: buffer.length,
        },
      })

      migrated += 1
      console.log(`✓ [${row.id}] ${filename} (${buffer.length} bytes)`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      failures.push({ id: row.id, filename: row.filename, error: message })
      console.error(`✗ [${row.id}] ${row.filename}: ${message}`)
    }
  }

  console.log('\n--- Done ---')
  console.log(`Migrated: ${migrated}`)
  console.log(`Skipped (no source URL): ${skipped}`)
  console.log(`Failed: ${failures.length}`)
  if (failures.length > 0) {
    console.log(JSON.stringify(failures, null, 2))
  }

  process.exit(failures.length > 0 ? 1 : 0)
}

main()
