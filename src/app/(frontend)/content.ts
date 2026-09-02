// ─────────────────────────────────────────────────────────────
// Personalize your site here. Nothing below requires touching
// any other file — just edit the strings and redeploy.
// ─────────────────────────────────────────────────────────────

/** Her name (or nickname), used across the Home page. */
export const herName = 'You'

/** The date it all started — used for the "days together" counter. Format: YYYY-MM-DD. */
export const togetherSince = '2025-01-02'

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
    funFact: 'Edit this one — put the real (embarrassing) answer here.',
  },
  {
    question: 'Most likely to text "morning?" first',
    options: ['Me', 'You', 'Both, simultaneously', 'We just show up'],
    correctIndex: 2,
    funFact: 'Edit this one too — this is your quiz, make it yours.',
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
