'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// Fisher-Yates — a fresh random order of every index each time the bag refills.
function shuffled(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function ReasonGenerator({ reasons }: { reasons: string[] }) {
  const [index, setIndex] = useState<number | null>(null)
  const [count, setCount] = useState(0)
  // A "shuffle bag": a random-ordered queue of every reason. Draw from it
  // until empty, then reshuffle a new one — so it stays random each round,
  // but the whole set is always seen once before anything repeats.
  const bagRef = useRef<number[]>([])

  if (reasons.length === 0) return null

  const showNext = () => {
    if (bagRef.current.length === 0) {
      const bag = shuffled(reasons.length)
      // Don't let the new bag's first draw match what's on screen right now —
      // that would read as a repeat across the cycle boundary.
      if (reasons.length > 1 && bag[0] === index) {
        ;[bag[0], bag[1]] = [bag[1], bag[0]]
      }
      bagRef.current = bag
    }
    const next = bagRef.current.shift()!
    setIndex(next)
    setCount((c) => c + 1)
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button
        onClick={showNext}
        className="tap-shrink rounded-full bg-rose px-6 py-3 text-base font-semibold text-white shadow-lg shadow-rose/30 transition hover:bg-berry sm:text-lg"
      >
        {index === null ? 'Tap for a reason I love you' : 'Give me another one'}
      </button>

      <div className="min-h-[6rem] w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {index !== null && (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="font-serif text-lg text-berry sm:text-xl"
            >
              &ldquo;{reasons[index]}&rdquo;
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {count >= 3 && (
        <p className="text-xs text-berry/60">
          {count} reasons deep and I&apos;m still not out of material. 😌
        </p>
      )}
    </div>
  )
}
