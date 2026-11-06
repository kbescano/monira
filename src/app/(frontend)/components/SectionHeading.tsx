export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-rose/50 sm:w-16" />
      <span className="h-1.5 w-1.5 rotate-45 bg-rose" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-rose/50 sm:w-16" />
    </div>
  )
}

export default function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 text-center sm:px-0">
      {eyebrow && (
        <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-rose">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-md font-serif text-2xl text-berry sm:text-3xl">{title}</h2>
      <Ornament />
    </div>
  )
}
