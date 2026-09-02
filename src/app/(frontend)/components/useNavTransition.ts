'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Wraps nav-link clicks in a React transition so the tapped item can show a
 * pending state immediately (before the new route's data has even started
 * loading) — separate from and in addition to loading.tsx, which covers the
 * server-fetch itself once the transition lands.
 */
export function useNavTransition() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const go = (href: string, currentPath: string) => (e: React.MouseEvent) => {
    if (href === currentPath) return
    e.preventDefault()
    setPendingHref(href)
    startTransition(() => {
      router.push(href)
    })
  }

  return { isPending, pendingHref, go }
}
