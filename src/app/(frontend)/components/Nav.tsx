'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '../content'
import { logout } from '../login/actions'
import NotificationBell from './NotificationBell'
import { useNavTransition } from './useNavTransition'
import type { Person } from '@/lib/dailyPassword'

const links = [
  { href: '/memories', label: nav.memories },
  { href: '/letters', label: nav.letters },
  { href: '/videos', label: nav.videos },
]

export default function Nav({ currentUser }: { currentUser: Person | null }) {
  const pathname = usePathname()
  const { isPending, pendingHref, go } = useNavTransition()

  if (pathname === '/login') return null

  return (
    <header className="glass sticky top-0 z-40 border-b border-rose/10">
      <div className="flex flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-8 sm:py-3">
        <Link
          href="/"
          onClick={go('/', pathname)}
          className={`whitespace-nowrap font-script text-lg leading-none text-berry transition-opacity sm:text-2xl ${
            isPending && pendingHref === '/' ? 'opacity-40' : ''
          }`}
        >
          💌 {nav.brand}
        </Link>
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Text links live here for desktop only — mobile uses the bottom
              icon bar instead (BottomNav), Instagram-style. */}
          <nav className="hidden items-center gap-1.5 sm:flex">
            {links.map((link) => {
              const active = pathname === link.href
              const loading = isPending && pendingHref === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={go(link.href, pathname)}
                  className={`tap-shrink flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? 'bg-rose text-white shadow-sm' : 'text-berry/80 hover:bg-rose/10'
                  } ${loading ? 'opacity-60' : ''}`}
                >
                  {loading && (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <NotificationBell currentUser={currentUser} />

          <form action={logout}>
            <button
              type="submit"
              className="tap-shrink whitespace-nowrap px-1 text-[10px] text-berry/40 transition hover:text-berry/70 sm:px-2 sm:text-xs"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
