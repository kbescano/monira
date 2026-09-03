'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

type Letter = {
  id: string
  to: string
  message: string
  createdAt: string
  pinned: boolean
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function PinnedLettersButton({ letters }: { letters: Letter[] }) {
  const [open, setOpen] = useState(false)
  const pinned = letters.filter((l) => l.pinned)

  if (pinned.length === 0) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`View ${pinned.length} pinned letter${pinned.length === 1 ? '' : 's'}`}
        className="tap-shrink fixed right-4 top-16 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-berry text-white shadow-lg shadow-berry/30 transition hover:scale-105 hover:bg-plum active:scale-95 sm:right-8 sm:top-[4.5rem]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 4h6l-1 6 4 4v1H6v-1l4-4-1-6Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 15v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white ring-2 ring-cream">
          {pinned.length}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-plum shadow-2xl sm:rounded-3xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-plum px-6 py-4">
                <h2 className="flex items-center gap-2 font-script text-2xl text-cream">
                  <span aria-hidden="true">📌</span> Pinned letters
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-cream/60 transition hover:bg-white/10 hover:text-cream"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="flex flex-col gap-4">
                  {pinned.map((letter, i) => (
                    <motion.div
                      key={letter.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-widest text-rose/90">
                        <span className="flex items-center gap-1.5">
                          <span aria-hidden="true">📌</span>
                          To {letter.to}
                        </span>
                        <span className="flex-shrink-0 text-cream/40">{formatDate(letter.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed text-cream/85">
                        {letter.message}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
