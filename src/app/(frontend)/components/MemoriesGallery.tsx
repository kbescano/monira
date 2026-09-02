'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'

export type MemoryItem = {
  id: string
  title: string
  description: string
  memoryDate: string | null
  imageUrl: string
  imageAlt: string
  width: number
  height: number
}

function formatDate(value: string | null) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return null
  }
}

export default function MemoriesGallery({ memories }: { memories: MemoryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = () => setOpenIndex(null)
  const showPrev = () =>
    setOpenIndex((i) => (i === null ? null : (i - 1 + memories.length) % memories.length))
  const showNext = () => setOpenIndex((i) => (i === null ? null : (i + 1) % memories.length))

  useEffect(() => {
    if (openIndex === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, memories.length])

  const active = openIndex !== null ? memories[openIndex] : null

  return (
    <>
      <div className="grid grid-cols-3 gap-[2px] sm:grid-cols-3 sm:gap-1 md:grid-cols-4 md:gap-1.5">
        {memories.map((memory, i) => (
          <button
            key={memory.id}
            onClick={() => setOpenIndex(i)}
            className="tap-shrink group relative aspect-square overflow-hidden bg-blush"
          >
            <Image
              src={memory.imageUrl}
              alt={memory.imageAlt}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="p-2 text-left text-xs font-medium text-white sm:text-sm">
                {memory.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-plum/80 p-0 sm:p-6"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden bg-white sm:rounded-3xl sm:shadow-2xl md:flex-row"
            >
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
              >
                ✕
              </button>

              <div className="relative aspect-square w-full shrink-0 bg-blush md:aspect-auto md:w-1/2">
                <Image
                  src={active.imageUrl}
                  alt={active.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {memories.length > 1 && (
                  <>
                    <button
                      onClick={showPrev}
                      aria-label="Previous memory"
                      className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                    >
                      ‹
                    </button>
                    <button
                      onClick={showNext}
                      aria-label="Next memory"
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-5 sm:p-6">
                {formatDate(active.memoryDate) && (
                  <span className="text-xs font-medium uppercase tracking-wide text-rose">
                    {formatDate(active.memoryDate)}
                  </span>
                )}
                <h3 className="font-serif text-xl text-berry sm:text-2xl">{active.title}</h3>
                <p className="whitespace-pre-line text-sm text-plum/80 sm:text-base">
                  {active.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
