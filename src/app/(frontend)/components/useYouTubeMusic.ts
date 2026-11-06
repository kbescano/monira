'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Just the slice of YouTube's IFrame Player API this uses.
type YTPlayer = {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setVolume(volume: number): void
  destroy(): void
}
type YTPlayerOptions = {
  host: string
  videoId: string
  playerVars: Record<string, string | number>
  events: {
    onReady: () => void
    onStateChange: (event: { data: number }) => void
    onError: () => void
  }
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayer }
    onYouTubeIframeAPIReady?: () => void
  }
}

const STATE_ENDED = 0
const STATE_PLAYING = 1
const STATE_PAUSED = 2
const VOLUME = 60
// If nothing is playing this long after asking, assume the browser blocked it.
const START_TIMEOUT_MS = 5000

export type MusicStatus = 'off' | 'loading' | 'on'

let apiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    })
  }
  return apiPromise
}

/**
 * Background music from a YouTube video, played through YouTube's own
 * embedded player. `host` is an element the (invisible) player gets mounted in.
 * Call `prepare()` early so the player is ready, then `play()` straight from a
 * tap — browsers only allow sound that starts from a user gesture.
 */
export function useYouTubeMusic(videoId: string, host: HTMLElement | null) {
  const [armed, setArmed] = useState(false)
  const [status, setStatus] = useState<MusicStatus>('off')
  const [failed, setFailed] = useState(false)
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)
  const wantPlayRef = useRef(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  const clearStartTimeout = () => window.clearTimeout(timeoutRef.current)

  useEffect(() => {
    if (!armed || !host) return
    let cancelled = false
    let player: YTPlayer | null = null

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return
      const mount = document.createElement('div')
      host.appendChild(mount)
      player = new window.YT.Player(mount, {
        // The privacy-enhanced domain — no tracking cookies until played.
        host: 'https://www.youtube-nocookie.com',
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            readyRef.current = true
            player?.setVolume(VOLUME)
            if (wantPlayRef.current) player?.playVideo()
          },
          onStateChange: (event) => {
            if (event.data === STATE_PLAYING) {
              clearStartTimeout()
              setStatus('on')
            } else if (event.data === STATE_PAUSED) {
              setStatus('off')
            } else if (event.data === STATE_ENDED) {
              player?.seekTo(0, true)
              player?.playVideo()
            }
          },
          onError: () => {
            clearStartTimeout()
            setFailed(true)
            setStatus('off')
          },
        },
      })
      playerRef.current = player
    })

    return () => {
      cancelled = true
      clearStartTimeout()
      readyRef.current = false
      playerRef.current = null
      try {
        player?.destroy()
      } catch {
        // The player may already be gone along with its iframe.
      }
    }
  }, [armed, host, videoId])

  const prepare = useCallback(() => setArmed(true), [])

  const play = useCallback(() => {
    wantPlayRef.current = true
    setStatus('loading')
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setStatus('off'), START_TIMEOUT_MS)
    if (readyRef.current) playerRef.current?.playVideo()
    else setArmed(true)
  }, [])

  const pause = useCallback(() => {
    wantPlayRef.current = false
    window.clearTimeout(timeoutRef.current)
    playerRef.current?.pauseVideo()
    setStatus('off')
  }, [])

  const toggle = useCallback(() => {
    if (status === 'off') play()
    else pause()
  }, [status, play, pause])

  return { status, failed, prepare, play, pause, toggle }
}
