'use client'

import { useEffect, useState } from 'react'
import { togetherSince } from '../content'

function getElapsed(since: string) {
  const start = new Date(since).getTime()
  const now = Date.now()
  const diff = Math.max(now - start, 0)

  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)

  return { days, hours, minutes, seconds }
}

export default function TogetherCounter({
  since = togetherSince,
  title = 'Time you’ve put up with me:',
  footnote = '(and counting, hopefully forever)',
  variant = 'lg',
}: {
  since?: string
  title?: string
  footnote?: string
  /** `sm` is the compact version for secondary counters — drops the seconds. */
  variant?: 'lg' | 'sm'
}) {
  const [elapsed, setElapsed] = useState<ReturnType<typeof getElapsed> | null>(null)
  const small = variant === 'sm'

  useEffect(() => {
    setElapsed(getElapsed(since))
    const id = setInterval(() => setElapsed(getElapsed(since)), 1000)
    return () => clearInterval(id)
  }, [since])

  if (!elapsed) return null

  const units: [number, string][] = [
    [elapsed.days, 'days'],
    [elapsed.hours, 'hrs'],
    [elapsed.minutes, 'min'],
    ...(small ? [] : ([[elapsed.seconds, 'sec']] as [number, string][])),
  ]

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className={small ? 'text-xs text-berry/70 sm:text-sm' : 'text-sm text-berry/70'}>
        {title}
      </p>
      <div className={small ? 'flex gap-1.5 sm:gap-2' : 'flex gap-3 sm:gap-4'}>
        {units.map(([value, label]) => (
          <div
            key={label}
            className={
              small
                ? 'flex min-w-[2.75rem] flex-col items-center rounded-xl bg-white/70 px-2 py-1.5 shadow-sm sm:min-w-[3.25rem]'
                : 'flex min-w-[3.25rem] flex-col items-center rounded-2xl bg-white/70 px-3 py-2 shadow-sm sm:min-w-[4rem]'
            }
          >
            <span
              className={`font-serif font-semibold text-berry ${small ? 'text-lg' : 'text-xl sm:text-2xl'}`}
            >
              {value}
            </span>
            <span
              className={`uppercase tracking-wide text-berry/60 ${small ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className={small ? 'text-[11px] text-berry/50' : 'text-xs text-berry/50'}>{footnote}</p>
    </div>
  )
}
