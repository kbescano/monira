'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import type { Person } from '@/lib/dailyPassword'

export default function WriteLoveLetter({
  currentUser,
  defaultTo,
}: {
  currentUser: Person | null
  defaultTo: Person
}) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  // There's only ever one valid recipient (the other logged-in person) — no
  // picker needed, this can't be changed.
  const to = defaultTo
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setMessage('')
    setSaving(false)
    setError(null)
  }

  const close = () => {
    if (saving) return
    setOpen(false)
    reset()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Write something first.')
      return
    }
    setError(null)
    setSaving(true)

    try {
      const res = await fetch('/api/love-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message: message.trim(), from: currentUser ?? undefined }),
      })
      if (!res.ok) throw new Error('Could not save the letter. Please try again.')

      setOpen(false)
      reset()
      router.refresh()
    } catch (err) {
      setSaving(false)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Write a love letter"
        className="tap-shrink fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-rose text-white shadow-lg shadow-rose/30 transition hover:scale-105 hover:bg-berry active:scale-95 sm:bottom-8 sm:right-8"
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
                <h2 className="font-script text-2xl text-berry">Write a love letter</h2>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-berry/50 transition hover:bg-rose/10 hover:text-berry"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-rose">
                    To
                  </span>
                  <div className="rounded-full border border-berry bg-berry px-4 py-2.5 text-center text-sm font-medium text-white">
                    {to}
                  </div>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dear..."
                  rows={7}
                  maxLength={4000}
                  className="resize-none rounded-xl border border-rose/20 bg-white px-4 py-3 font-serif text-[15px] leading-relaxed text-plum placeholder:font-sans placeholder:text-plum/40 focus:border-rose/50 focus:outline-none"
                />

                {error && <p className="text-sm text-berry">{error}</p>}

                <button
                  type="submit"
                  disabled={saving}
                  className="tap-shrink mt-1 rounded-full bg-rose py-3 text-sm font-semibold text-white shadow-md transition hover:bg-berry disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save letter'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
