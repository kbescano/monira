'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '../content'

const links = [
  { href: '/', label: nav.home },
  { href: '/memories', label: nav.memories },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="glass sticky top-0 z-40 border-b border-rose/10">
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <Link href="/" className="font-script text-2xl text-berry">
          💌 {nav.brand}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`tap-shrink rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                  active ? 'bg-rose text-white shadow-sm' : 'text-berry/80 hover:bg-rose/10'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
