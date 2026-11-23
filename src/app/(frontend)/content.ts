// ─────────────────────────────────────────────────────────────
// Personalize your site here. Nothing below requires touching
// any other file — just edit the strings and redeploy.
// ─────────────────────────────────────────────────────────────

/** Her name (or nickname), used across the Home page. */
export const herName = 'Nira'

/** The date it all started — used for the "days together" counter. Format: YYYY-MM-DD. */
export const togetherSince = '2025-01-02'

/** When they last parted ways — used for the "apart" counter. Manila time. */
export const apartSince = '2026-09-19T08:30:00+08:00'

/** The moment she said yes — used for the "since she said yes" counter. Manila time. */
export const saidYesAt = '2026-09-15T16:45:00+08:00'

/**
 * Music for the "Fall into forever" reasons dive — a YouTube video ID (the part
 * after v= in the link). It plays through YouTube's own embedded player, and
 * only works for videos that allow embedding.
 */
export const reasonsMusic = { videoId: '-BjZmE2gtdo' }

/** The closing line at the very bottom of the Home page. */
export const signOff = 'Always yours.'

/**
 * The "Do you want us back?" question Nira meets after logging in, and the terms
 * behind it. `short` is the one-liner shown in the summary on the front page
 * once she's said yes. Edit any of this freely — it's all just text.
 */
export const reunion = {
  eyebrow: 'A question, before anything else',
  title: 'Do you want us back?',
  lead: 'Do you want us to go back together — even though we’re not really broken up?',
  leadAside: 'Like… do you want the old us back?',
  reassurance: 'Take your time. There’s no wrong answer — only an honest one.',
  termsIntro: 'Here’s what I’ll give you — and what we both promise.',
  signature: '— Ken',
  benefits: [
    { icon: '📱', title: 'A new phone', description: 'Yours, on me.', short: 'New phone' },
    {
      icon: '📸',
      title: 'New memories',
      description: 'More of them — made together, on purpose.',
      short: 'New memories',
    },
    {
      icon: '💐',
      title: 'Monthly gifts or flowers',
      description: 'Every month, no occasion needed.',
      short: 'Monthly gifts or flowers',
    },
    {
      icon: '🍽️',
      title: 'A proper date, every month',
      description: 'Once you’re back here — we’re long-distance for now. Dressed up, phones away.',
      short: 'Monthly date, once you’re back',
    },
    {
      icon: '✈️',
      title: 'A getaway, just us',
      description: 'Somewhere new, planned by me.',
      short: 'A getaway',
    },
    {
      icon: '🎂',
      title: 'Special days, done right',
      description: 'Birthdays and anniversaries — never missed.',
      short: 'Special days',
    },
    {
      icon: '🍜',
      title: 'Comfort on the hard days',
      description: 'Your favorite food, delivered.',
      short: 'Comfort on hard days',
    },
    {
      icon: '💌',
      title: 'Little surprises',
      description: 'Notes, messages, small things — just because.',
      short: 'Little surprises',
    },
  ],
  conditions: [
    {
      title: 'Intimacy, with clarity',
      description:
        'Once in a blue moon — and that’s understood. No pressure, no guilt, no keeping score.',
      short: 'Intimacy: once in a blue moon',
    },
    {
      title: 'Timely updates',
      description: 'Updates come on time, without having to be asked.',
      short: 'Timely updates, without asking',
    },
    {
      title: 'Everyday call',
      description: 'A call every day — even a short one.',
      short: 'A call, every day',
    },
    {
      title: 'Everyday voice message or video call',
      description: 'A voice message or a video call, every day. I want to hear you and see you.',
      short: 'A voice message or video call, daily',
    },
    {
      title: 'Reassurance',
      description: 'Given freely — especially on the hard days.',
      short: 'Reassurance, freely given',
    },
    {
      title: 'Love without being asked',
      description: 'Shown, never requested.',
      short: 'Love, without being asked',
    },
    {
      title: 'Our wedding & our future',
      description: 'We plan them together — for real.',
      short: 'Planning our wedding & future',
    },
    {
      title: 'No more blame',
      description: 'We face problems together, not point fingers.',
      short: 'No more blame',
    },
    {
      title: 'Feelings, freely',
      description: 'We say what we feel, openly and honestly.',
      short: 'Open, honest communication',
    },
    {
      title: 'Always mindful of each other',
      description: 'In whatever we do, we remember how our partner will feel.',
      short: 'Mindful of each other’s feelings',
    },
    {
      title: 'No more social drama',
      description: 'Nothing — online or with other people — that hurts or embarrasses the other.',
      short: 'No more social drama',
    },
    {
      title: 'Talk it out the same day',
      description: 'No silent treatment, no going cold.',
      short: 'No silent treatment',
    },
    {
      title: 'Honest, even when it’s hard',
      description: 'No hiding, no half-truths.',
      short: 'Honesty, always',
    },
    {
      title: 'Sorry, and meant',
      description: 'Apologize quickly, forgive fully — old fights stay in the past.',
      short: 'Quick sorrys, full forgiveness',
    },
    {
      title: 'Each other first',
      description: 'Problems get worked out between us before anyone else hears of them.',
      short: 'Each other first',
    },
  ],
}

export const hero = {
  eyebrow: "A tiny app. For my one and only.",
  title: `For ${herName}, obviously.`,
  subtitle:
    "I could've just chat you this, but I made you a whole app instead. That's how you know it's serious.",
}

// "Why I love you" reasons moved to the database — see the Reasons collection
// (src/collections/Reasons.ts). Edit/add/remove them from /admin now instead
// of here, so they no longer require a redeploy.

/** Shown after the runaway button finally gets caught. */
export const caughtMessages = [
  'Caught you! (Unlike my feelings for you, which you caught immediately.)',
  "Ha! Got it. Turns out you're faster at running than I am at flirting.",
  'Victory! Please accept this trophy: 🏆 (redeemable for a real hug later)',
]

export type QuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
  /** Shown after they answer, correct or not — this is the punchline. */
  funFact: string
}

/** "How well do you know us" quiz on the Home page. Edit freely — swap in your own inside jokes. */
export const quiz: QuizQuestion[] = [
  {
    question: 'How long after meeting in person did things get... interesting? 😏',
    options: ['12 hours', '12 days', '12 dates', "We're still waiting"],
    correctIndex: 0,
    funFact: 'Twelve hours. Zero regrets. Efficiency is a love language, apparently.',
  },
  {
    question: 'Who fell first?',
    options: ['Me, obviously', 'You, obviously', 'We tied', "Neither, we're normal"],
    correctIndex: 0,
    funFact: 'Fell first, fell hardest, zero regrets.',
  },
  {
    question: 'Most likely to text "morning?" first',
    options: ['Me', 'You', 'Both, simultaneously', 'We just show up'],
    correctIndex: 2,
    funFact: "Same minute, every time. Either telepathy or we're both terrible at waiting.",
  },
   {
    question: 'Who always starts an argument first? Haha',
    options: ['Me', 'You', 'Both, simultaneously', 'We just show up'],
    correctIndex: 1,
    funFact: 'No question about this one — we both know the answer.',
  },
]

export const nav = {
  brand: 'Love Nira always',
  home: 'Home',
  memories: 'Memories',
  letters: 'Letters',
  videos: 'Videos',
  viewOnce: 'View once',
}

export const memoriesPage = {
  title: 'Our Memories',
  subtitle: 'Every little moment worth keeping, in one place.',
  emptyTitle: 'Nothing here yet...',
  emptySubtitle:
    "The memory book is empty for now — add the first one from the admin dashboard and it'll show up right here.",
}

export const lettersPage = {
  title: 'Love Letters',
  subtitle: 'Little notes, written and kept, whenever there was something to say.',
  emptyTitle: 'No letters yet',
  emptySubtitle: 'Tap the + and write the first one.',
}
