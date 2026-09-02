'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Person } from '@/lib/dailyPassword'

type Notification = {
  id: string
  message: string
  read: boolean
  createdAt: string
  link: string | null
}

type RawDoc = {
  id: number | string
  message: string
  read?: boolean
  createdAt: string
  link?: string | null
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function NotificationBell({ currentUser }: { currentUser: Person | null }) {
  const [items, setItems] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    if (!currentUser) return
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const params = new URLSearchParams({
      'where[forUser][equals]': currentUser,
      'where[createdAt][greater_than]': since,
      sort: '-createdAt',
      limit: '50',
      depth: '0',
    })
    try {
      const res = await fetch(`/api/notifications?${params.toString()}`)
      if (!res.ok) return
      const data = (await res.json()) as { docs?: RawDoc[] }
      setItems(
        (data.docs ?? []).map((d) => ({
          id: String(d.id),
          message: d.message,
          read: Boolean(d.read),
          createdAt: d.createdAt,
          link: d.link ?? null,
        })),
      )
    } catch {
      // Silent — the bell just keeps showing whatever it last had.
    }
  }, [currentUser])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const unreadCount = items.filter((i) => !i.read).length

  const markAllRead = async () => {
    const unread = items.filter((i) => !i.read)
    if (unread.length === 0) return
    setItems((prev) => prev.map((i) => ({ ...i, read: true })))
    await Promise.all(
      unread.map((i) =>
        fetch(`/api/notifications/${i.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        }).catch(() => {}),
      ),
    )
  }

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) markAllRead()
  }

  if (!currentUser) return null

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-berry/70 transition hover:bg-rose/10 hover:text-berry"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 18.5a2.5 2.5 0 0 0 5 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 max-h-96 w-72 overflow-y-auto rounded-2xl border border-rose/15 bg-white shadow-xl">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-plum/50">Nothing in the last day.</p>
            ) : (
              items.map((n) =>
                n.link ? (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setOpen(false)}
                    className="block border-b border-rose/10 px-4 py-3 transition last:border-0 hover:bg-rose/5"
                  >
                    <p className="text-sm text-plum">{n.message}</p>
                    <p className="mt-0.5 text-xs text-plum/40">{timeAgo(n.createdAt)}</p>
                  </Link>
                ) : (
                  <div key={n.id} className="border-b border-rose/10 px-4 py-3 last:border-0">
                    <p className="text-sm text-plum">{n.message}</p>
                    <p className="mt-0.5 text-xs text-plum/40">{timeAgo(n.createdAt)}</p>
                  </div>
                ),
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}
