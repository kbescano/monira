'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '../content'
import { useNavTransition } from './useNavTransition'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
    </svg>
  )
}

function EnvelopeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <path d="M4.5 6.5 12 12l7.5-5.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GhostIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5c-3.6 0-6.5 2.9-6.5 6.5v9.3a.7.7 0 0 0 1.16.53l1.6-1.4 1.6 1.4a.9.9 0 0 0 1.18 0l1.46-1.28 1.46 1.28a.9.9 0 0 0 1.18 0l1.6-1.4 1.6 1.4a.7.7 0 0 0 1.16-.53V10c0-3.6-2.9-6.5-6.5-6.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10.5" r="1" fill="currentColor" />
    </svg>
  )
}

const items = [
  { href: '/', label: nav.home, Icon: HomeIcon },
  { href: '/memories', label: nav.memories, Icon: GridIcon },
  { href: '/letters', label: nav.letters, Icon: EnvelopeIcon },
  { href: '/videos', label: nav.viewOnce, Icon: GhostIcon },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { isPending, pendingHref, go } = useNavTransition()

  if (pathname === '/login') return null

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-rose/10 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href
          const loading = isPending && pendingHref === href
          return (
            <Link
              key={href}
              href={href}
              onClick={go(href, pathname)}
              className={`tap-shrink flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-opacity ${
                active ? 'text-berry' : 'text-plum/40'
              } ${loading ? 'opacity-40' : ''}`}
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icon active={active} />
              )}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
