/**
 * Uploads a recorded voice-note Blob straight to R2 (no size or length cap —
 * bypasses Vercel's serverless request-body limit via the same clientUploads
 * presigned-URL path used for vanishing videos) and registers it as a
 * `voice-notes` doc. Returns the new doc's id, ready to attach to a letter's
 * `voiceNote` field.
 */
export async function uploadVoiceNote(blob: Blob): Promise<string> {
  const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'
  const filename = `voice-${Date.now()}.${extension}`
  const mimeType = blob.type || 'audio/webm'

  const presignRes = await fetch('/api/storage-s3-generate-signed-url', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionSlug: 'voice-notes', filename, filesize: blob.size, mimeType }),
  })
  if (!presignRes.ok) throw new Error('Could not upload the voice note. Please try again.')
  const { url: uploadUrl } = (await presignRes.json()) as { url: string }

  const putRes = await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': mimeType } })
  if (!putRes.ok) throw new Error('Could not upload the voice note. Please try again.')

  const form = new FormData()
  form.append('file', JSON.stringify({ collectionSlug: 'voice-notes', filename, mimeType, size: blob.size }))
  const registerRes = await fetch('/api/voice-notes', { method: 'POST', body: form })
  if (!registerRes.ok) throw new Error('Could not save the voice note. Please try again.')
  const { doc } = (await registerRes.json()) as { doc: { id: string | number } }
  return String(doc.id)
}
