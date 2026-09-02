'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { reasons } from '../content'

export default function ReasonGenerator() {
  const [index, setIndex] = useState<number | null>(null)
  const [count, setCount] = useState(0)

  const showNext = () => {
    let next = Math.floor(Math.random() * reasons.length)
    // Avoid repeating the same reason twice in a row when possible.
    if (reasons.length > 1 && next === index) {
      next = (next + 1) % reasons.length
    }
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
