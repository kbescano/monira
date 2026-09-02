'use client'

import { useState } from 'react'
import { caughtMessages } from '../content'

const MAX_DODGES = 5

function randomPos() {
  return {
    top: 15 + Math.random() * 65,
    left: 10 + Math.random() * 80,
  }
}

// Fixed, deterministic starting point so server and client markup match on
// first render — actual randomization only ever happens client-side, in
// response to a user interaction (dodge/click), never during render itself.
const CENTER_POS = { top: 50, left: 50 }

export default function RunawayKiss() {
  const [pos, setPos] = useState(CENTER_POS)
  const [dodgeCount, setDodgeCount] = useState(0)
  const [caught, setCaught] = useState(false)
  const [message, setMessage] = useState('')

  const dodge = () => {
    setPos(randomPos())
    setDodgeCount((c) => c + 1)
  }

  const handleMouseEnter = () => {
    if (!caught && dodgeCount < MAX_DODGES) dodge()
  }

  const handleClick = () => {
    if (caught) return
    if (dodgeCount < MAX_DODGES) {
      dodge()
      return
    }
    setCaught(true)
    setMessage(caughtMessages[Math.floor(Math.random() * caughtMessages.length)])
  }

  const playAgain = () => {
    setCaught(false)
    setDodgeCount(0)
    setPos(randomPos())
    setMessage('')
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <p className="text-sm text-berry/70">Think you can catch a kiss? 😘</p>
      <div className="relative h-48 w-full overflow-hidden rounded-3xl border-2 border-dashed border-rose/30 bg-blush/40 sm:h-56">
        {!caught ? (
          <button
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            className="tap-shrink absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white shadow-md transition-[top,left] duration-300 ease-out sm:px-5 sm:py-2.5 sm:text-base"
            style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
          >
            Catch me 💋
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="font-serif text-lg text-berry sm:text-xl">{message}</p>
            <button
              onClick={playAgain}
              className="tap-shrink mt-1 rounded-full border border-rose/40 px-4 py-1.5 text-xs font-medium text-berry/80 hover:bg-rose/10 sm:text-sm"
            >
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
