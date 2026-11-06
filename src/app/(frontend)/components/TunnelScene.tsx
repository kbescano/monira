'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import { drawTunnel, makeParticles } from './tunnel'

export type TunnelControls = { advance: (slots: number) => void }

type Props = {
  order: string[]
  reduce?: boolean
  controlsRef?: MutableRefObject<TunnelControls | null>
  onFocusSlot?: (slot: number) => void
  onFirstMove?: () => void
}

// Reasons are recycled through a small pool of DOM nodes as you fall past them.
const POOL = 7
// A reason is sharp when it's this many slots ahead; it flies past at 0.
const FOCUS = 0.5
// However hard you flick, you can only get this far ahead of where you are.
const MAX_LEAD = 2.5
const WHEEL_SENS = 0.0055
const TOUCH_SENS = 0.0065
// Once input stops, drift on to the nearest reason so one is always readable.
const SNAP_DELAY_MS = 450

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Where a reason sits when it is `r` slots ahead. Far away it's small, faint
 * and blurred off to one side (above for even slots, below for odd); it swings
 * in to the centre to be read, then rushes past the camera, growing as it goes.
 */
function textStyle(r: number, n: number, w: number, h: number, reduce: boolean) {
  if (reduce) {
    return { opacity: Math.abs(r - FOCUS) < 0.5 ? 1 : 0, scale: 1, blur: 0, x: 0, y: 0 }
  }
  const lane = n % 2 === 0 ? -1 : 1
  const hx = hash(n) * 2 - 1

  if (r >= FOCUS) {
    const f = r - FOCUS
    const scale = 1 / (1 + 1.5 * f)
    const lift = Math.min(1, f / 0.8)
    // Offsets shrink slower than the text does, so the next few reasons keep
    // clear of a long one being read in the middle.
    const reach = Math.pow(scale, 0.6) * lift
    return {
      opacity: Math.pow(Math.max(0, 1 - f / 4.6), 1.9),
      scale,
      blur: Math.min(f * 2.4, 7),
      x: hx * 0.25 * w * reach,
      y: lane * 0.5 * h * reach,
    }
  }

  const p = Math.min(1, FOCUS - r)
  return {
    opacity: Math.max(0, 1 - Math.pow(p, 1.6)),
    scale: 1 + p * p * 5.5,
    blur: p * 9,
    x: hx * p * p * 0.5 * w,
    y: lane * p * p * 0.6 * h,
  }
}

export default function TunnelScene({
  order,
  reduce = false,
  controlsRef,
  onFocusSlot,
  onFirstMove,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const callbacksRef = useRef({ onFocusSlot, onFirstMove })

  useEffect(() => {
    callbacksRef.current = { onFocusSlot, onFirstMove }
  })

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!root || !canvas || !ctx || order.length === 0) return

    const total = order.length
    const nodes = nodeRefs.current
    const particles = makeParticles(220)

    let width = 0
    let height = 0
    let depth = 0
    let target = 0
    let velocity = 0
    let lastInput = 0
    let lastDir = 1
    let moved = false
    let focused = -1
    let raf = 0
    const startedAt = performance.now()
    let lastTime = startedAt

    const layoutText = () => {
      const base = Math.floor(depth)
      for (let n = base; n < base + POOL; n++) {
        const el = nodes[((n % POOL) + POOL) % POOL]
        if (!el) continue
        if (el.dataset.slot !== String(n)) {
          el.dataset.slot = String(n)
          ;(el.firstElementChild as HTMLElement).textContent = `№ ${n + 1}`
          const text = order[((n % total) + total) % total]
          ;(el.lastElementChild as HTMLElement).textContent = text
          // Long reasons get a smaller type size so they never swamp the screen.
          el.style.setProperty(
            '--fit',
            text.length > 150 ? '0.7' : text.length > 100 ? '0.82' : '1',
          )
        }
        const st = textStyle(n + FOCUS - depth, n, width, height, reduce)
        el.style.opacity = st.opacity.toFixed(3)
        el.style.visibility = st.opacity < 0.01 ? 'hidden' : 'visible'
        el.style.transform = `translate(-50%, -50%) translate(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px) scale(${st.scale.toFixed(3)})`
        el.style.filter = st.blur > 0.3 ? `blur(${st.blur.toFixed(1)}px)` : 'none'
      }
    }

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      const prev = depth

      if (reduce) {
        depth = target
      } else {
        if (now - lastInput > SNAP_DELAY_MS) {
          const snap = Math.max(
            0,
            lastDir > 0 ? Math.ceil(target - 0.12) : Math.floor(target + 0.12),
          )
          if (snap !== target) target = snap
        }
        depth += (target - depth) * (1 - Math.exp(-dt * 5.5))
      }
      velocity = dt > 0 ? (depth - prev) / dt : 0

      if (width > 0 && height > 0) {
        drawTunnel(ctx, width, height, depth, velocity, (now - startedAt) / 1000, particles)
        layoutText()
      }

      const slot = Math.max(0, Math.round(depth))
      if (slot !== focused) {
        focused = slot
        callbacksRef.current.onFocusSlot?.(slot)
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      step(now)
    }

    const resize = () => {
      const rect = root.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduce) step(performance.now())
    }

    const nudge = (delta: number) => {
      const now = performance.now()
      if (reduce && now - lastInput < 350) return
      lastInput = now
      lastDir = delta > 0 ? 1 : -1
      if (!moved) {
        moved = true
        callbacksRef.current.onFirstMove?.()
      }
      if (reduce) {
        target = Math.max(0, Math.round(target) + lastDir)
        step(now)
        return
      }
      const next = Math.min(Math.max(target + delta, depth - MAX_LEAD), depth + MAX_LEAD)
      target = Math.max(0, next)
    }

    if (controlsRef) controlsRef.current = { advance: nudge }

    const cleanups: (() => void)[] = []
    const listen = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement,
      type: K,
      handler: (e: HTMLElementEventMap[K]) => void,
      options?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, handler, options)
      cleanups.push(() => el.removeEventListener(type, handler, options))
    }

    listen(
      root,
      'wheel',
      (e) => {
        e.preventDefault()
        const raw = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY
        nudge(Math.max(-150, Math.min(150, raw)) * WHEEL_SENS)
      },
      { passive: false },
    )

    let touchY = 0
    let touchT = 0
    let touchV = 0
    listen(root, 'touchstart', (e) => {
      touchY = e.touches[0].clientY
      touchT = performance.now()
      touchV = 0
    })
    listen(
      root,
      'touchmove',
      (e) => {
        e.preventDefault()
        const y = e.touches[0].clientY
        const t = performance.now()
        const dy = touchY - y
        touchV = 0.8 * touchV + 0.2 * (dy / Math.max(1, t - touchT))
        touchY = y
        touchT = t
        nudge(dy * TOUCH_SENS)
      },
      { passive: false },
    )
    listen(root, 'touchend', () => {
      if (Math.abs(touchV) > 0.3) nudge(touchV * 140 * TOUCH_SENS)
      touchV = 0
    })

    const onKey = (e: KeyboardEvent) => {
      const onButton = (e.target as HTMLElement | null)?.tagName === 'BUTTON'
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !onButton)) {
        e.preventDefault()
        nudge(1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        nudge(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    cleanups.push(() => window.removeEventListener('keydown', onKey))

    const ro = new ResizeObserver(resize)
    ro.observe(root)
    cleanups.push(() => ro.disconnect())

    resize()
    if (reduce) step(performance.now())
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      cleanups.forEach((fn) => fn())
      if (controlsRef) controlsRef.current = null
    }
  }, [order, reduce, controlsRef])

  return (
    <div ref={rootRef} className="absolute inset-0 touch-none overflow-hidden overscroll-contain">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      {Array.from({ length: POOL }, (_, j) => (
        <div
          key={j}
          ref={(el) => {
            nodeRefs.current[j] = el
          }}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 text-center"
          style={{
            opacity: 0,
            visibility: 'hidden',
            width: 'min(86vw, 34rem)',
            willChange: 'transform, opacity, filter',
          }}
        >
          <span className="mb-2 block font-display text-[10px] font-semibold uppercase tracking-[0.34em] text-rose sm:text-[11px]" />
          <p
            className="font-display font-bold leading-[1.18] tracking-tight text-[#fff1f5]"
            style={{
              fontSize: 'calc(clamp(1.45rem, 5.4vw, 2.6rem) * var(--fit, 1))',
              textShadow: '0 0 28px rgba(255,111,145,0.7), 0 0 4px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      ))}
    </div>
  )
}
