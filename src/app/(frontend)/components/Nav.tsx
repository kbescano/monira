'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '../content'

const links = [
  { href: '/', label: nav.home },
  { href: '/memories', label: nav.memories },
  { href: '/letters', label: nav.letters },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="glass sticky top-0 z-40 border-b border-rose/10">
      <div className="flex flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-8 sm:py-3">
        <Link
          href="/"
          className="whitespace-nowrap font-script text-lg leading-none text-berry sm:text-2xl"
        >
          💌 {nav.brand}
        </Link>
        <nav className="flex flex-shrink-0 items-center gap-0.5 sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`tap-shrink whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-base ${
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
