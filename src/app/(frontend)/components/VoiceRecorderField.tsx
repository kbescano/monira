'use client'

import { useEffect, useRef, useState } from 'react'
import VoiceNotePlayer from './VoiceNotePlayer'

function pickAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return undefined
  const candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
  return candidates.find((c) => MediaRecorder.isTypeSupported(c))
}

function formatTime(seconds: number): string {
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function VoiceRecorderField({
  blob,
  onRecorded,
  disabled,
}: {
  blob: Blob | null
  onRecorded: (blob: Blob | null) => void
  disabled?: boolean
}) {
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Clean up the mic stream and object URL if this unmounts mid-recording
  // (e.g. the compose modal gets closed).
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!blob) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setElapsed(0)
    }
  }, [blob])

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickAudioMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: mimeType ?? 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setPreviewUrl(URL.createObjectURL(recordedBlob))
        onRecorded(recordedBlob)
      }

      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
      startedAtRef.current = Date.now()
      // No cap — just counts up for as long as they keep talking.
      tickRef.current = setInterval(() => {
        setElapsed((Date.now() - startedAtRef.current) / 1000)
      }, 200)
    } catch {
      setError("Couldn't access the microphone.")
    }
  }

  const stopRecording = () => {
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = null
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    setRecording(false)
  }

  const discard = () => {
    onRecorded(null)
  }

  if (blob && previewUrl) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose/20 bg-white px-4 py-3">
        <VoiceNotePlayer src={previewUrl} className="h-9 flex-1" />
        <button
          type="button"
          onClick={discard}
          disabled={disabled}
          aria-label="Remove voice note"
          className="flex-shrink-0 text-xs font-medium text-berry/60 underline underline-offset-2 transition hover:text-berry disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled}
        aria-pressed={recording}
        className={`tap-shrink flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
          recording
            ? 'border-rose bg-rose/10 text-berry'
            : 'border-rose/20 bg-white text-plum/60 hover:border-rose/40'
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${recording ? 'animate-pulse bg-rose' : 'bg-plum/30'}`} />
        {recording ? `Recording… ${formatTime(elapsed)} — tap to stop` : 'Record a voice note'}
      </button>
      {error && <p className="text-xs text-berry">{error}</p>}
    </div>
  )
}
