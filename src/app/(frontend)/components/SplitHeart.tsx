'use client'

import { useId } from 'react'

const HEART =
  'M50 85 C20 60 3 42 3 26 C3 12 14 3 27 3 C37 3 46 9 50 18 C54 9 63 3 73 3 C86 3 97 12 97 26 C97 42 80 60 50 85 Z'
// A jagged line down the middle: the left and right halves of the heart are
// clipped along it, so they can drift apart and meet again.
const CRACK: [number, number][] = [
  [50, -2],
  [53, 14],
  [47, 26],
  [54, 38],
  [46, 50],
  [53, 62],
  [47, 74],
  [50, 92],
]
const LEFT = ['0,-2', ...CRACK.map((p) => p.join(',')), '0,92'].join(' ')
const RIGHT = ['100,-2', '100,92', ...[...CRACK].reverse().map((p) => p.join(','))].join(' ')

/** A glossy heart that starts broken in two and, when `healed` flips on, comes back together. */
export default function SplitHeart({
  healed,
  instant = false,
  className = '',
}: {
  healed: boolean
  /** Skip the animation (reduced motion). */
  instant?: boolean
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const face = (
    <>
      <path d={HEART} fill={`url(#grad-${id})`} />
      <path d={HEART} fill={`url(#gloss-${id})`} />
    </>
  )
  const move = instant
    ? 'none'
    : 'transform 1s cubic-bezier(.2,.9,.25,1.15), opacity .01s linear 1.02s'
  const half = (apart: string) =>
    ({
      transformOrigin: '50px 80px',
      transform: healed ? 'none' : apart,
      opacity: healed ? 0 : 1,
      transition: move,
    }) as const

  return (
    <svg viewBox="0 0 100 90" aria-hidden="true" className={`overflow-visible ${className}`}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ff7a98" />
          <stop offset="0.55" stopColor="#e0295a" />
          <stop offset="1" stopColor="#b0123e" />
        </linearGradient>
        <radialGradient id={`gloss-${id}`} cx="0.3" cy="0.22" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`left-${id}`}>
          <polygon points={LEFT} />
        </clipPath>
        <clipPath id={`right-${id}`}>
          <polygon points={RIGHT} />
        </clipPath>
      </defs>
      <g style={half('translate(-5px, 0) rotate(-8deg)')}>
        <g clipPath={`url(#left-${id})`}>{face}</g>
      </g>
      <g style={half('translate(5px, 2px) rotate(8deg)')}>
        <g clipPath={`url(#right-${id})`}>{face}</g>
      </g>
      {/* Whole again: swapped in once the halves have met, so there's no seam. */}
      <g
        style={{
          opacity: healed ? 1 : 0,
          transition: instant ? 'none' : 'opacity .01s linear 1.02s',
        }}
      >
        {face}
      </g>
    </svg>
  )
}
