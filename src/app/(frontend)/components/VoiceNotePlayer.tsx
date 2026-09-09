'use client'

/**
 * `<audio>` for a MediaRecorder-produced voice note. Chrome (and others)
 * frequently mis-report the duration of recorded webm/mp4 blobs — showing
 * some unrelated number (18s for a 3s recording is typical) — because the
 * container's duration field isn't written correctly by the recorder, and
 * playback then stops at the real end while the displayed duration stays
 * wrong. Seeking somewhere absurdly far forces the browser to actually scan
 * to the true end of the stream and correct its cached duration; resetting
 * back to 0 right after means the listener never sees the seek happen.
 */
export default function VoiceNotePlayer({
  src,
  className,
  onClick,
}: {
  src: string
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAudioElement>) => void
}) {
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget
    const fixDuration = () => {
      audio.currentTime = 0
      audio.removeEventListener('timeupdate', fixDuration)
    }
    audio.addEventListener('timeupdate', fixDuration)
    audio.currentTime = 1e10
  }

  return (
    <audio
      src={src}
      controls
      onLoadedMetadata={handleLoadedMetadata}
      onClick={onClick}
      className={className}
    />
  )
}
