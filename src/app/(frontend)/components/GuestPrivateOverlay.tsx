import type { ReactNode } from 'react'

// Wraps a whole page's content in a blur for the guest account — `inert`
// (not just pointer-events-none) so it can't be reached by tab/keyboard
// either, with a fixed message on top explaining why.
export default function GuestPrivateOverlay({
  isGuest,
  children,
}: {
  isGuest: boolean
  children: ReactNode
}) {
  return (
    <div className="relative">
      <div className={isGuest ? 'select-none blur-md' : undefined} inert={isGuest}>
        {children}
      </div>

      {isGuest && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-5xl">🔒</span>
          <h2 className="font-serif text-2xl text-berry">Just for the two of them</h2>
          <p className="max-w-sm text-sm text-plum/70">
            This page is private between Ken and Nira only.
          </p>
        </div>
      )}
    </div>
  )
}
