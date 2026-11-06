// Canvas drawing for the "infinity hole": concentric heart outlines spiralling
// into a black heart, with stars, tiny hearts and petals streaming past.
// All distances are in "slots" — one slot is the gap between two reasons.

const TAU = Math.PI * 2

// The classic heart curve, normalised to roughly unit size around its centre.
const HEART: number[] = (() => {
  const points: number[] = []
  const steps = 72
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * TAU
    const x = 16 * Math.sin(t) ** 3
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    points.push(x / 17, (y - 2.5) / 17)
  }
  return points
})()

let heartPath2D: Path2D | null = null
function getHeartPath2D(): Path2D {
  if (!heartPath2D) {
    heartPath2D = new Path2D()
    for (let i = 0; i < HEART.length; i += 2) {
      if (i === 0) heartPath2D.moveTo(HEART[i], HEART[i + 1])
      else heartPath2D.lineTo(HEART[i], HEART[i + 1])
    }
    heartPath2D.closePath()
  }
  return heartPath2D
}

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot: number) {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  ctx.beginPath()
  for (let i = 0; i < HEART.length; i += 2) {
    const x = HEART[i] * r
    const y = HEART[i + 1] * r
    const px = cx + x * c - y * s
    const py = cy + x * s + y * c
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

export type Particle = {
  angle: number
  rho: number
  z: number
  kind: 0 | 1 | 2
  size: number
  twinkle: number
}

const PARTICLE_DEPTH = 7

export function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const pick = Math.random()
    return {
      angle: Math.random() * TAU,
      rho: 0.12 + Math.random() * 0.95,
      z: Math.random() * PARTICLE_DEPTH,
      kind: pick < 0.7 ? 0 : pick < 0.88 ? 1 : 2,
      size: 0.6 + Math.random() * 1.4,
      twinkle: Math.random() * TAU,
    }
  })
}

const RING_STEP = 0.22
const RING_RANGE = 6.2
// Rose, pink, magenta, warm rose — cycled per ring.
const RING_HUES = [346, 332, 306, 352]

/** Perspective scale for something `r` slots ahead. */
function perspective(r: number) {
  return 0.34 / (r + 0.045)
}

export function drawTunnel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  depth: number,
  velocity: number,
  time: number,
  particles: Particle[],
) {
  const cx = width / 2
  const cy = height / 2
  const big = Math.max(width, height)
  const small = Math.min(width, height)

  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#0d0208'
  ctx.fillRect(0, 0, width, height)

  // Slow-drifting nebula in love colours
  const nebula = (x: number, y: number, rgb: string, alpha: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, big * 0.62)
    g.addColorStop(0, `rgba(${rgb},${alpha})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)
  }
  nebula(width * 0.26 + Math.sin(time * 0.07) * width * 0.05, height * 0.28, '201,24,74', 0.34)
  nebula(width * 0.8, height * 0.74 + Math.cos(time * 0.06) * height * 0.04, '150,60,200', 0.24)
  nebula(width * 0.7, height * 0.18, '255,111,145', 0.14)

  // Glow pooling around the centre, like light bending at the horizon
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, big * 0.42)
  glow.addColorStop(0, 'rgba(255,111,145,0.3)')
  glow.addColorStop(0.5, 'rgba(150,20,80,0.14)')
  glow.addColorStop(1, 'rgba(150,20,80,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  ctx.globalCompositeOperation = 'lighter'

  // Heart rings, far to near, each turned a little more than the last
  const firstRing = Math.floor(depth / RING_STEP)
  for (let k = firstRing + Math.ceil(RING_RANGE / RING_STEP); k >= firstRing; k--) {
    const r = k * RING_STEP - depth
    if (r < 0.03 || r > RING_RANGE) continue
    const s = perspective(r)
    const radius = s * big * 0.5
    const far = 1 - r / RING_RANGE
    const near = Math.min(1, r / 0.12)
    const alpha = far * far * near * 0.9
    if (alpha < 0.01) continue
    const hue = RING_HUES[((k % 4) + 4) % 4]
    const rot = k * 0.21 + depth * 0.28 + time * 0.06
    const line = Math.max(0.6, Math.min(5, s * 2.2))

    heartPath(ctx, cx, cy, radius, rot)
    ctx.lineWidth = line * 3
    ctx.strokeStyle = `hsla(${hue} 90% 55% / ${alpha * 0.2})`
    ctx.stroke()
    ctx.lineWidth = line
    ctx.strokeStyle = `hsla(${hue} 95% 70% / ${alpha})`
    ctx.stroke()
  }

  // Stars, hearts and petals rushing outward past the camera
  const streak = Math.abs(velocity) > 0.35
  for (const p of particles) {
    const rr = (((p.z - depth) % PARTICLE_DEPTH) + PARTICLE_DEPTH) % PARTICLE_DEPTH
    if (rr < 0.04) continue
    const s = perspective(rr)
    const R = p.rho * big * 0.55
    const angle = p.angle + depth * 0.12 + time * 0.02
    const x = cx + Math.cos(angle) * R * s
    const y = cy + Math.sin(angle) * R * s
    if (x < -40 || x > width + 40 || y < -40 || y > height + 40) continue

    const fade = Math.min(1, rr / 0.25) * (1 - rr / PARTICLE_DEPTH)
    const alpha = fade * (0.7 + 0.3 * Math.sin(time * 2 + p.twinkle))
    if (alpha < 0.02) continue
    const size = p.size * Math.min(3.4, 0.6 + s * 1.3)

    if (p.kind === 0) {
      if (streak) {
        const prevS = perspective(rr + velocity * 0.045)
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * R * prevS, cy + Math.sin(angle) * R * prevS)
        ctx.lineTo(x, y)
        ctx.lineWidth = size
        ctx.strokeStyle = `rgba(255,214,228,${alpha})`
        ctx.stroke()
      } else {
        ctx.fillStyle = `rgba(255,222,234,${alpha})`
        ctx.fillRect(x - size / 2, y - size / 2, size, size)
      }
    } else if (p.kind === 1) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle + Math.PI / 2)
      ctx.scale(size * 3, size * 3)
      ctx.fillStyle = `rgba(255,111,145,${alpha})`
      ctx.fill(getHeartPath2D())
      ctx.restore()
    } else {
      ctx.beginPath()
      ctx.ellipse(x, y, size * 2.6, size * 1.3, angle + time * 0.4, 0, TAU)
      ctx.fillStyle = `rgba(214,40,80,${alpha})`
      ctx.fill()
    }
  }

  ctx.globalCompositeOperation = 'source-over'

  // Dark edges keep the text readable and push the eye inward
  const vignette = ctx.createRadialGradient(cx, cy, big * 0.18, cx, cy, big * 0.72)
  vignette.addColorStop(0, 'rgba(8,1,5,0)')
  vignette.addColorStop(1, 'rgba(8,1,5,0.8)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)

  // The hole itself: a black heart with a glowing rim
  const core = small * 0.075 * (1 + 0.04 * Math.sin(time * 2))
  ctx.save()
  ctx.shadowColor = 'rgba(255,111,145,0.9)'
  ctx.shadowBlur = 26
  heartPath(ctx, cx, cy, core, 0)
  ctx.fillStyle = '#050003'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255,150,180,0.85)'
  ctx.stroke()
  ctx.restore()
}
