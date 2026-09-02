import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = params.next && params.next.startsWith('/') ? params.next : '/'
  const hasError = params.error === '1'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blush via-cream to-cream px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-rose/15 bg-white/70 p-8 text-center shadow-sm shadow-rose/10">
        <span className="text-3xl">💌</span>
        <h1 className="mt-3 font-script text-3xl text-berry">Just us</h1>
        <p className="mt-1 text-sm text-plum/60">This little corner is private — sign in first.</p>

        <form action={login} className="mt-6 flex flex-col gap-3 text-left">
          <input type="hidden" name="next" value={next} />

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-rose">
              Username
            </span>
            <input
              name="username"
              autoComplete="username"
              required
              className="rounded-xl border border-rose/20 bg-white px-4 py-2.5 text-sm text-plum placeholder:text-plum/40 focus:border-rose/50 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-rose">
              Password
            </span>
            <input
              name="password"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              required
              className="rounded-xl border border-rose/20 bg-white px-4 py-2.5 text-sm text-plum placeholder:text-plum/40 focus:border-rose/50 focus:outline-none"
            />
          </label>

          {hasError && (
            <p className="text-sm text-berry">That username or password isn&apos;t right.</p>
          )}

          <button
            type="submit"
            className="tap-shrink mt-2 rounded-full bg-rose py-3 text-sm font-semibold text-white shadow-md transition hover:bg-berry"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
