'use client'

import Image from 'next/image'
import { motion } from 'motion/react'

export type HeroPhoto = { id: string; url: string; alt: string }

type Slot = { x: number; y: number; rotate: number; z: number }

// Slots are in photo order (newest first) — the newest always lands in front.
const SLOTS: Record<number, Slot[]> = {
  1: [{ x: 0, y: 0, rotate: -2, z: 2 }],
  2: [
    { x: 46, y: 0, rotate: 6, z: 2 },
    { x: -46, y: 8, rotate: -7, z: 1 },
  ],
  3: [
    { x: 0, y: -4, rotate: 0, z: 3 },
    { x: -86, y: 10, rotate: -9, z: 1 },
    { x: 86, y: 8, rotate: 8, z: 2 },
  ],
}

/** The newest few memories fanned out like polaroids under the hero text. */
export default function HeroPhotos({ photos }: { photos: HeroPhoto[] }) {
  if (photos.length === 0) return null
  const slots = SLOTS[Math.min(photos.length, 3)]

  return (
    <div className="relative mt-4 h-[11.5rem] w-full max-w-sm sm:h-[13rem]">
      {photos.slice(0, 3).map((photo, i) => {
        const slot = slots[i]
        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, x: 0, y: 40, rotate: 0 }}
            animate={{ opacity: 1, x: slot.x, y: slot.y, rotate: slot.rotate }}
            whileHover={{ y: slot.y - 8, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.5 + i * 0.14 }}
            className="absolute left-1/2 top-0 -ml-[3.4rem] h-[9.5rem] w-[6.8rem] rounded-sm bg-white p-1.5 pb-6 shadow-xl shadow-berry/20 sm:-ml-[4rem] sm:h-[11rem] sm:w-32"
            style={{ zIndex: slot.z }}
          >
            <div className="relative h-full w-full overflow-hidden bg-blush">
              <Image src={photo.url} alt={photo.alt} fill sizes="128px" className="object-cover" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
