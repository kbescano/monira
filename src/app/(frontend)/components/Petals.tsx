'use client'

import { useEffect, useState } from 'react'

const TONES = ['#d62850', '#ff6f91', '#c9184a', '#ff9bb0']

type Petal = {
  id: number
  left: number
  size: number
  fall: number
  sway: number
  delay: number
  tone: string
}

function makePetal(id: number): Petal {
  return {
    id,
    left: Math.random() * 100,
    size: 9 + Math.random() * 11,
    fall: 14 + Math.random() * 10,
    sway: 3 + Math.random() * 3,
    // Negative so the page opens with petals already mid-fall.
    delay: -Math.random() * 24,
    tone: TONES[Math.floor(Math.random() * TONES.length)],
  }
}

/** A few rose petals drifting down behind the page. Client-only (after mount) so server and client markup match. */
export default function Petals({ count = 14 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    setPetals(Array.from({ length: count }, (_, i) => makePetal(i)))
  }, [count])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden"
      aria-hidden="true"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block animate-petalFall"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.fall}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <span
            className="block animate-petalSway"
            style={{
              width: p.size,
              height: p.size * 1.15,
              background: `linear-gradient(135deg, ${p.tone}, ${p.tone}b3)`,
              borderRadius: '150% 0 150% 0',
              opacity: 0.55,
              animationDuration: `${p.sway}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  )
}
