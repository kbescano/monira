'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { quiz } from '../content'

function verdict(score: number, total: number) {
  const ratio = total === 0 ? 0 : score / total
  if (ratio === 1) return "Perfect score. Are you secretly me? 🤔"
  if (ratio >= 0.5) return "Pretty solid. You've clearly been paying attention."
  return "Bold guesses. We should talk more. 😅"
}

export default function QuizGame() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (quiz.length === 0) return null

  const current = quiz[step]
  const isLast = step === quiz.length - 1

  const handleSelect = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correctIndex) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (isLast) {
      setFinished(true)
      return
    }
    setStep((s) => s + 1)
    setSelected(null)
  }

  const restart = () => {
    setStep(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-3xl border-2 border-dashed border-rose/30 bg-blush/40 px-4 py-6 sm:px-8">
      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-rose">
              Question {step + 1} of {quiz.length}
            </span>
            <p className="font-serif text-lg text-berry sm:text-xl">{current.question}</p>

            <div className="flex w-full flex-col gap-2">
              {current.options.map((option, i) => {
                const isSelected = selected === i
                const isCorrect = i === current.correctIndex
                const revealed = selected !== null

                let stateClasses = 'border-rose/30 bg-white/70 hover:bg-white text-plum'
                if (revealed && isCorrect) {
                  stateClasses = 'border-emerald-400 bg-emerald-100 text-emerald-800'
                } else if (revealed && isSelected && !isCorrect) {
                  stateClasses = 'border-berry/50 bg-berry/10 text-berry'
                } else if (revealed) {
                  stateClasses = 'border-rose/10 bg-white/40 text-plum/50'
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(i)}
                    disabled={revealed}
                    className={`tap-shrink rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors sm:text-base ${stateClasses}`}
                  >
                    {option}
                    {revealed && isCorrect ? ' ✓' : ''}
                    {revealed && isSelected && !isCorrect ? ' ✗' : ''}
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <p className="text-sm text-plum/70 sm:text-base">{current.funFact}</p>
                <button
                  onClick={handleNext}
                  className="tap-shrink rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-berry sm:text-base"
                >
                  {isLast ? 'See my score' : 'Next question →'}
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="text-4xl">🏆</span>
            <p className="font-serif text-xl text-berry sm:text-2xl">
              {score} / {quiz.length}
            </p>
            <p className="text-sm text-plum/70 sm:text-base">{verdict(score, quiz.length)}</p>
            <button
              onClick={restart}
              className="tap-shrink mt-1 rounded-full border border-rose/40 px-4 py-1.5 text-xs font-medium text-berry/80 hover:bg-rose/10 sm:text-sm"
            >
              Take it again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
