import Link from 'next/link'
import { reunion } from '../content'
import { Ornament } from './SectionHeading'
import { BenefitCards, ConditionCards } from './TermsLists'

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** The short version of the terms, kept on the front page once she's said yes. */
export default function ReunionPromise({
  acceptedAt,
  showAnswersLink = false,
}: {
  acceptedAt: string
  showAnswersLink?: boolean
}) {
  return (
    <section
      className="w-full max-w-md rounded-[1.6rem] border-[1.5px] border-transparent px-5 pb-5 pt-6 text-center shadow-2xl shadow-berry/20"
      style={{
        background:
          'linear-gradient(#fffdfb,#fffdfb) padding-box, linear-gradient(135deg,#ff6f91,#efe4f7 45%,#c9184a) border-box',
      }}
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-rose">
        Our promise
      </p>
      <h3 className="mt-2 font-serif text-2xl font-semibold text-berry">
        Back together, on purpose
      </h3>
      <p className="mt-1 text-xs text-plum/55">Agreed {formatDay(acceptedAt)}</p>
      <Ornament className="justify-center" />

      <h4 className="mb-2.5 mt-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-berry">
        What I give
      </h4>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {reunion.benefits.map((b) => (
          <li
            key={b.title}
            className="rounded-full bg-blush px-3 py-1.5 text-[11.5px] font-semibold text-berry"
          >
            {b.icon} {b.short}
          </li>
        ))}
      </ul>

      <h4 className="mb-2.5 mt-6 text-[10px] font-semibold uppercase tracking-[0.26em] text-berry">
        What we both promise
      </h4>
      <ul className="mx-auto grid max-w-[18.5rem] gap-1.5 text-left">
        {reunion.conditions.map((c) => (
          <li key={c.title} className="flex gap-2.5 text-[13px] leading-snug text-plum/85">
            <span aria-hidden="true" className="shrink-0 font-bold text-berry">
              ✓
            </span>
            {c.short}
          </li>
        ))}
      </ul>

      <details className="group mt-4">
        <summary className="cursor-pointer list-none p-2 text-[13px] font-semibold text-berry [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Read the full terms ▾</span>
          <span className="hidden group-open:inline">Hide the full terms ▴</span>
        </summary>
        <div className="mt-2 grid gap-6 text-left">
          <BenefitCards />
          <ConditionCards />
        </div>
      </details>

      <div className="mt-4 flex items-baseline justify-center gap-2.5 text-plum/50">
        <span className="font-script text-3xl text-berry">Nira</span>
        <span>&amp;</span>
        <span className="font-script text-3xl text-berry">Ken</span>
      </div>

      {showAnswersLink && (
        <Link
          href="/pact"
          className="mt-3 inline-block text-xs font-medium text-plum/50 hover:text-berry"
        >
          Her answers →
        </Link>
      )}
    </section>
  )
}
