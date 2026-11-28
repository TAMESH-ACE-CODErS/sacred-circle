import { useCallback, useEffect, useRef } from 'react'

const PREVIEW_AT_SECONDS = 1.5

/**
 * Adds a media fragment so the browser fetches a visible frame, then seeks on
 * metadata/data events as a fallback for mobile Safari and Chrome.
 */
function previewSource(src: string): string {
  try {
    const parsed = new URL(src, window.location.origin)
    parsed.hash = `t=${PREVIEW_AT_SECONDS}`
    return parsed.toString()
  } catch {
    return `${src}${src.includes('#') ? '' : `#t=${PREVIEW_AT_SECONDS}`}`
  }
}

type Props = {
  src: string
  poster?: string
  title: string
  className?: string
}

export function SmartVideo({ src, poster, title, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const soughtRef = useRef(false)

  useEffect(() => {
    soughtRef.current = false
  }, [src])

  const seekToPreview = useCallback(() => {
    const video = videoRef.current
    if (!video || soughtRef.current) return

    const target = Number.isFinite(video.duration) && video.duration > 0
      ? Math.min(PREVIEW_AT_SECONDS, video.duration * 0.1)
      : PREVIEW_AT_SECONDS

    if (target <= 0.05) return
    soughtRef.current = true
    try {
      video.currentTime = target
    } catch {
      soughtRef.current = false
    }
  }, [])

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={title}
      className={className}
      src={previewSource(src)}
      onLoadedMetadata={seekToPreview}
      onLoadedData={seekToPreview}
    >
      Your browser does not support video playback.
    </video>
  )
}
