'use client'

import { useEffect, useState } from 'react'
import { togetherSince } from '../content'

function getElapsed() {
  const start = new Date(togetherSince).getTime()
  const now = Date.now()
  const diff = Math.max(now - start, 0)

  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)

  return { days, hours, minutes, seconds }
}

export default function TogetherCounter() {
  const [elapsed, setElapsed] = useState<ReturnType<typeof getElapsed> | null>(null)

  useEffect(() => {
    setElapsed(getElapsed())
    const id = setInterval(() => setElapsed(getElapsed()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!elapsed) return null

  const units: [number, string][] = [
    [elapsed.days, 'days'],
    [elapsed.hours, 'hrs'],
    [elapsed.minutes, 'min'],
    [elapsed.seconds, 'sec'],
  ]

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-berry/70">Time you&apos;ve put up with me:</p>
      <div className="flex gap-3 sm:gap-4">
        {units.map(([value, label]) => (
          <div
            key={label}
            className="flex min-w-[3.25rem] flex-col items-center rounded-2xl bg-white/70 px-3 py-2 shadow-sm sm:min-w-[4rem]"
          >
            <span className="font-serif text-xl font-semibold text-berry sm:text-2xl">
              {value}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-berry/60 sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-berry/50">(and counting, hopefully forever)</p>
    </div>
  )
}
