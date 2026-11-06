'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

// Opacity + slide only, deliberately no blur: a lingering `filter` (even
// blur(0)) would turn this wrapper into the containing block for any
// position:fixed child inside it.
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
