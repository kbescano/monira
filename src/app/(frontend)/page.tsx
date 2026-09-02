import Link from 'next/link'
import FloatingHearts from './components/FloatingHearts'
import ReasonGenerator from './components/ReasonGenerator'
import RunawayKiss from './components/RunawayKiss'
import TogetherCounter from './components/TogetherCounter'
import { hero, nav } from './content'

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blush via-cream to-cream">
      <FloatingHearts />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-14 px-0 pb-24 pt-16 text-center sm:px-6 sm:pt-24">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
          <span className="text-sm font-medium uppercase tracking-widest text-rose">
            {hero.eyebrow}
          </span>
          <h1 className="font-script text-5xl leading-tight text-berry sm:text-6xl">
            {hero.title}
          </h1>
          <p className="max-w-md text-base text-plum/80 sm:text-lg">{hero.subtitle}</p>
        </div>

        {/* Days together counter */}
        <TogetherCounter />

        {/* Reason generator */}
        <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
          <h2 className="font-serif text-2xl text-berry sm:text-3xl">
            In case you forgot why I&apos;m obsessed with you
          </h2>
          <ReasonGenerator />
        </div>

        {/* Runaway kiss game */}
        <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
          <h2 className="font-serif text-2xl text-berry sm:text-3xl">
            One more thing before you go
          </h2>
          <RunawayKiss />
        </div>

        {/* CTA to memories */}
        <div className="flex flex-col items-center gap-3 px-4 sm:px-0">
          <p className="text-plum/70">Want proof this isn&apos;t all talk?</p>
          <Link
            href="/memories"
            className="tap-shrink rounded-full border-2 border-berry px-6 py-3 text-base font-semibold text-berry transition hover:bg-berry hover:text-white"
          >
            See our {nav.memories.toLowerCase()} →
          </Link>
        </div>
      </div>
    </div>
  )
}
