import { reunion } from '../content'

const CARD =
  'flex items-start gap-3 rounded-2xl border border-rose/20 bg-white/80 px-3.5 py-3 text-left shadow-md shadow-berry/10'

export function BenefitCards() {
  return (
    <ul className="grid gap-2.5">
      {reunion.benefits.map((b) => (
        <li key={b.title} className={CARD}>
          <span className="mt-px shrink-0 text-2xl leading-none">{b.icon}</span>
          <div>
            <h4 className="text-[14.5px] font-semibold leading-snug text-plum">{b.title}</h4>
            <p className="mt-0.5 text-[13px] leading-snug text-plum/65">{b.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ConditionCards() {
  return (
    <ol className="grid gap-2.5">
      {reunion.conditions.map((c, i) => (
        <li key={c.title} className={CARD}>
          <span className="mt-px flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose to-berry text-xs font-bold text-white">
            {i + 1}
          </span>
          <div>
            <h4 className="text-[14.5px] font-semibold leading-snug text-plum">{c.title}</h4>
            <p className="mt-0.5 text-[13px] leading-snug text-plum/65">{c.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
