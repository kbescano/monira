export default function GuestRestrictedNotice({ section }: { section: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <span className="text-4xl">🔒</span>
      <h2 className="font-serif text-xl text-berry">Just for the two of them</h2>
      <p className="max-w-sm text-sm text-plum/60">
        The guest account can&apos;t view {section} — it&apos;s private between Ken and Nira only.
      </p>
    </div>
  )
}
