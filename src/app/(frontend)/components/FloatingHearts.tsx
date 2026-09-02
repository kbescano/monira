'use client'

import { useEffect, useState } from 'react'

const EMOJIS = ['💕', '💖', '🥰', '💘', '😂', '✨', '💗']

type Heart = {
  id: number
  left: number
  duration: number
  delay: number
  size: number
  emoji: string
}

function makeHeart(id: number): Heart {
  return {
    id,
    left: Math.random() * 100,
    duration: 8 + Math.random() * 7,
    delay: Math.random() * 6,
    size: 16 + Math.random() * 20,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
  }
}

/**
 * A slow drift of hearts/emoji rising from the bottom of the viewport.
 * Generated client-side only (after mount) so server and client markup match.
 */
export default function FloatingHearts({ count = 18 }: { count?: number }) {
  const [hearts, setHearts] = useState<Heart[]>([])

  useEffect(() => {
    setHearts(Array.from({ length: count }, (_, i) => makeHeart(i)))
  }, [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-0 animate-float select-none"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}
