import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getReunionState } from '@/lib/reunion'
import { getCurrentUser } from '@/lib/session'
import { Ornament } from '../components/SectionHeading'

export const dynamic = 'force-dynamic'

type Answer = { id: string; kind: 'yes' | 'not-yet'; message: string; createdAt: string }

async function getAnswers(): Promise<{ answers: Answer[]; failed: boolean }> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'reunion-answers',
      sort: '-createdAt',
      limit: 100,
      depth: 0,
    })
    return {
      answers: docs.map((d) => ({
        id: String(d.id),
        kind: d.kind,
        message: d.message ?? '',
        createdAt: d.createdAt,
      })),
      failed: false,
    }
  } catch (error) {
    console.error('Failed to load reunion answers:', error)
    return { answers: [], failed: true }
  }
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Ken's view of how Nira answered "Do you want us back?" — every answer, with
// whatever she wrote. Nobody else can open it.
export default async function PactPage() {
  if ((await getCurrentUser()) !== 'Ken') redirect('/')

  const [{ answers, failed }, { acceptedAt }] = await Promise.all([getAnswers(), getReunionState()])

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-xl px-4 pb-24 pt-8 sm:px-6">
        <Link href="/" className="text-sm text-plum/55 hover:text-berry">
          ← Back home
        </Link>

        <div className="mt-6 flex flex-col items-center text-center">
          <h1 className="font-script text-4xl text-berry sm:text-5xl">Her answers</h1>
          <p className="mt-2 text-sm text-plum/70">
            {acceptedAt ? 'She said yes. 💕' : 'Still waiting for her answer.'}
          </p>
          <Ornament />
        </div>

        {failed ? (
          <p className="mt-10 text-center text-sm text-plum/60">
            Couldn’t load her answers right now.
          </p>
        ) : answers.length === 0 ? (
          <p className="mt-10 text-center text-sm text-plum/60">
            Nothing yet. When she answers, it’ll show up here.
          </p>
        ) : (
          <ul className="mt-8 grid gap-3">
            {answers.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-rose/20 bg-white/80 p-4 shadow-md shadow-berry/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      a.kind === 'yes' ? 'bg-berry text-white' : 'bg-blush text-berry'
                    }`}
                  >
                    {a.kind === 'yes' ? 'Yes — she wants us back 💕' : 'Not yet'}
                  </span>
                  <span className="text-right text-[11.5px] text-plum/45">
                    {formatWhen(a.createdAt)}
                  </span>
                </div>
                {a.message ? (
                  <p className="mt-3 whitespace-pre-line font-serif text-[16px] italic leading-relaxed text-plum">
                    “{a.message}”
                  </p>
                ) : a.kind === 'not-yet' ? (
                  <p className="mt-3 text-sm text-plum/45">She didn’t write anything.</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
