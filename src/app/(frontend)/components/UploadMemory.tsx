'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { compressImage } from './compressImage'

type Status = 'idle' | 'compressing' | 'uploading' | 'error'

export default function UploadMemory() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setFile(null)
    setPreview(null)
    setTitle('')
    setDescription('')
    setStatus('idle')
    setError(null)
  }

  const close = () => {
    if (status === 'compressing' || status === 'uploading') return
    setOpen(false)
    reset()
  }

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim() || !description.trim()) {
      setError('A photo, a title, and a caption are all needed.')
      return
    }
    setError(null)

    try {
      setStatus('compressing')
      const compressed = await compressImage(file)

      setStatus('uploading')

      const mediaForm = new FormData()
      mediaForm.append('file', compressed)
      mediaForm.append('_payload', JSON.stringify({ alt: title.trim() }))

      const mediaRes = await fetch('/api/media', { method: 'POST', body: mediaForm })
      if (!mediaRes.ok) throw new Error('Photo upload failed. Try a different image?')
      const mediaJson = await mediaRes.json()
      const mediaId = mediaJson?.doc?.id
      if (!mediaId) throw new Error('Photo upload failed. Try a different image?')

      const memoryRes = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          image: mediaId,
        }),
      })
      if (!memoryRes.ok) throw new Error('Could not save the memory. Please try again.')

      setOpen(false)
      reset()
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const busy = status === 'compressing' || status === 'uploading'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Add a memory"
        className="tap-shrink fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-rose text-white shadow-lg shadow-rose/30 transition hover:scale-105 hover:bg-berry active:scale-95 sm:bottom-8 sm:right-8"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-plum/50 backdrop-blur-sm sm:items-center"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-2xl sm:rounded-3xl sm:p-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-xl text-berry">Add a memory</h2>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-berry/50 transition hover:bg-rose/10 hover:text-berry"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-rose/30 bg-blush/20 transition hover:border-rose/50"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Selected" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1.5 text-plum/40">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M21 15l-5-5-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-sm">Tap to choose a photo</span>
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  maxLength={120}
                  className="rounded-xl border border-rose/20 bg-white px-4 py-2.5 text-sm text-plum placeholder:text-plum/40 focus:border-rose/50 focus:outline-none"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What made this one worth keeping?"
                  rows={3}
                  maxLength={500}
                  className="resize-none rounded-xl border border-rose/20 bg-white px-4 py-2.5 text-sm text-plum placeholder:text-plum/40 focus:border-rose/50 focus:outline-none"
                />

                {error && <p className="text-sm text-berry">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="tap-shrink mt-1 rounded-full bg-rose py-3 text-sm font-semibold text-white shadow-md transition hover:bg-berry disabled:opacity-50"
                >
                  {status === 'compressing'
                    ? 'Preparing photo…'
                    : status === 'uploading'
                      ? 'Uploading…'
                      : 'Add to memories'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
