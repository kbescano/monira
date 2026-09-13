import Link from 'next/link'

export default function ViewOnceGateNotice({ remaining }: { remaining: number }) {
  const message =
    remaining >= 3
      ? "Send 3 View Once videos first to unlock this."
      : remaining === 1
        ? 'Almost there — just 1 more to go.'
        : `Almost there — ${remaining} more to go.`

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <span className="text-4xl">🔒</span>
      <h2 className="font-serif text-xl text-berry">Not yet — one thing first</h2>
      <p className="max-w-sm text-sm text-plum/60">{message}</p>
      <Link
        href="/videos"
        className="tap-shrink mt-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition hover:bg-berry"
      >
        Go send one →
      </Link>
    </div>
  )
}
