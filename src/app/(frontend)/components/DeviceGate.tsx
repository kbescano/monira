'use client'

import { useEffect, useState } from 'react'
import { isMobileOrTablet } from './isMobileOrTablet'

/** Hides its children on desktop — used to keep View Once (photos + videos) phone/iPad-only. */
export default function DeviceGate({ children }: { children: React.ReactNode }) {
  const [eligible, setEligible] = useState<boolean | null>(null)

  useEffect(() => {
    setEligible(isMobileOrTablet())
  }, [])

  // Avoid a flash of the wrong state on first paint.
  if (eligible === null) return null

  if (!eligible) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-blush via-cream to-cream px-6 text-center">
        <span className="text-4xl">📱</span>
        <h1 className="font-serif text-xl text-berry">Phone or tablet only</h1>
        <p className="max-w-sm text-sm text-plum/60">
          View Once only works on mobile or iPad — open this page there instead.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
