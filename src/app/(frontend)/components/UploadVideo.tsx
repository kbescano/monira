'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import type { Person } from '@/lib/dailyPassword'

const MAX_MS = 10_000
const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// A soft guard for picked-from-library files — not a verified Cloudinary
// limit for video (that finding was specific to images on this account).
const MAX_BYTES = 100 * 1024 * 1024

type Status = 'idle' | 'uploading' | 'error'
type Mode = 'camera' | 'preview'

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return undefined
  const candidates = [
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]
  return candidates.find((c) => MediaRecorder.isTypeSupported(c))
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Could not read that file.'))
    }
    video.src = URL.createObjectURL(file)
  })
}

export default function UploadVideo({ currentUser }: { currentUser: Person | null }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef<number>(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('camera')
  const [cameraError, setCameraError] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [recording, setRecording] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1
  const [file, setFile] = useState<File | Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const startCamera = async () => {
    setCameraError(false)
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      })
      streamRef.current = stream
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream
      setCameraReady(true)
    } catch {
      setCameraError(true)
    }
  }

  useEffect(() => {
    if (open && mode === 'camera') startCamera()
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      stopStream()
      window.removeEventListener('mouseup', finishRecording)
      window.removeEventListener('touchend', finishRecording)
      window.removeEventListener('touchcancel', finishRecording)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode])

  const reset = () => {
    setMode('camera')
    setCameraError(false)
    setCameraReady(false)
    setRecording(false)
    setProgress(0)
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCaption('')
    setStatus('idle')
    setError(null)
    chunksRef.current = []
    if (tickRef.current) clearInterval(tickRef.current)
  }

  const close = () => {
    if (status === 'uploading') return
    stopStream()
    setOpen(false)
    reset()
  }

  const finishRecording = () => {
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = null
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    setRecording(false)
    window.removeEventListener('mouseup', finishRecording)
    window.removeEventListener('touchend', finishRecording)
    window.removeEventListener('touchcancel', finishRecording)
  }

  const startRecording = () => {
    const stream = streamRef.current
    if (!stream) {
      // Camera isn't ready yet (still requesting permission/initializing) —
      // surface this instead of silently doing nothing on press.
      setError('Camera is still starting up — try again in a second.')
      return
    }
    setError(null)
    chunksRef.current = []

    // Belt-and-suspenders: if the finger/cursor drifts off the button before
    // release, onMouseUp/onTouchEnd bound only to the button can miss firing
    // (mouseup targets whatever's under the cursor at release time). These
    // window-level listeners guarantee "release anywhere" still stops it.
    window.addEventListener('mouseup', finishRecording)
    window.addEventListener('touchend', finishRecording)
    window.addEventListener('touchcancel', finishRecording)

    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType ?? 'video/webm' })
      stopStream()
      setFile(blob)
      setPreviewUrl(URL.createObjectURL(blob))
      setMode('preview')
    }

    recorderRef.current = recorder
    recorder.start()
    setRecording(true)
    startedAtRef.current = Date.now()

    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current
      const pct = Math.min(elapsed / MAX_MS, 1)
      setProgress(pct)
      if (elapsed >= MAX_MS) finishRecording()
    }, 40)
  }

  const handlePickFile = async (f: File | null) => {
    if (!f) return
    setError(null)
    if (f.size > MAX_BYTES) {
      setError('That video is a bit too big (100MB max) — try a shorter clip.')
      return
    }
    try {
      const duration = await readDuration(f)
      if (duration > 10.5) {
        setError('Videos must be 10 seconds or under — trim it first.')
        return
      }
    } catch {
      // If duration can't be read, let the upload attempt happen anyway
      // rather than blocking on a browser quirk.
    }
    stopStream()
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setMode('preview')
  }

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setFile(null)
    setProgress(0)
    setMode('camera')
    startCamera()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Record or choose a video first.')
      return
    }
    setError(null)
    setStatus('uploading')

    try {
      const form = new FormData()
      const filename = file instanceof File ? file.name : `clip-${Date.now()}.webm`
      form.append('file', file, filename)
      form.append(
        '_payload',
        JSON.stringify({ caption: caption.trim() || undefined, uploadedBy: currentUser ?? undefined }),
      )

      const res = await fetch('/api/videos', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed. Try a smaller or different video?')

      setOpen(false)
      reset()
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const busy = status === 'uploading'
  const dashoffset = CIRCUMFERENCE * (1 - progress)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send a vanishing video"
        className="tap-shrink fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-rose text-white shadow-lg shadow-rose/30 transition hover:scale-105 hover:bg-berry active:scale-95 sm:bottom-8 sm:right-8"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-plum/60 backdrop-blur-sm sm:items-center"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl bg-plum sm:rounded-3xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between bg-plum px-5 pt-4">
                <h2 className="font-serif text-lg text-cream">Send a vanishing video</h2>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-cream/60 transition hover:bg-white/10 hover:text-cream"
                >
                  ✕
                </button>
              </div>

              {/* Camera / recording view */}
              {mode === 'camera' && (
                <div className="flex flex-col items-center gap-4 px-5 py-5">
                  <div className="relative mx-auto flex aspect-[3/4] h-[36vh] max-w-full items-center justify-center overflow-hidden rounded-2xl bg-black">
                    {cameraError ? (
                      <span className="px-6 text-center text-sm text-cream/60">
                        Couldn&apos;t access the camera. You can still choose a video below.
                      </span>
                    ) : (
                      <video
                        ref={liveVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-full w-full scale-x-[-1] object-cover"
                      />
                    )}
                  </div>

                  {!cameraError && (
                    <button
                      type="button"
                      onMouseDown={startRecording}
                      onMouseUp={finishRecording}
                      onTouchStart={(e) => {
                        e.preventDefault()
                        startRecording()
                      }}
                      onTouchEnd={finishRecording}
                      disabled={!cameraReady}
                      aria-label="Hold to record, up to 10 seconds"
                      className="relative flex h-20 w-20 items-center justify-center disabled:opacity-50"
                    >
                      <svg width="88" height="88" viewBox="0 0 88 88" className="absolute -rotate-90">
                        <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
                        <circle
                          cx="44"
                          cy="44"
                          r={RADIUS}
                          fill="none"
                          stroke="#ff6f91"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={CIRCUMFERENCE}
                          strokeDashoffset={dashoffset}
                          style={{ transition: recording ? 'none' : 'stroke-dashoffset 0.15s ease' }}
                        />
                      </svg>
                      <span
                        className={`h-14 w-14 rounded-full bg-rose transition-all ${
                          recording ? 'scale-90 rounded-2xl' : ''
                        }`}
                      />
                    </button>
                  )}

                  <p className="text-xs text-cream/50">
                    {recording
                      ? 'Recording… release to stop'
                      : cameraReady
                        ? 'Press and hold — up to 10 seconds'
                        : 'Starting camera…'}
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-cream/60 underline underline-offset-2 hover:text-cream"
                  >
                    Choose from library instead
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
                  />

                  {error && <p className="px-4 text-center text-sm text-rose">{error}</p>}
                </div>
              )}

              {/* Preview + send view */}
              {mode === 'preview' && previewUrl && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
                  <div className="mx-auto w-full max-w-xs overflow-hidden rounded-2xl bg-black">
                    <video
                      src={previewUrl}
                      controls
                      playsInline
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </div>

                  {error && <p className="text-sm text-rose">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={retake}
                      disabled={busy}
                      className="tap-shrink flex-1 rounded-full border border-white/20 py-3 text-sm font-medium text-cream/80 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      Retake
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="tap-shrink flex-1 rounded-full bg-rose py-3 text-sm font-semibold text-white shadow-md transition hover:bg-berry disabled:opacity-50"
                    >
                      {busy ? 'Uploading…' : 'Send it'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
