import { useEffect, useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  /** Prefer the explicit feed id when available; `src` is parsed as a fallback. */
  videoId?: string
}

const imageClass = 'h-full w-full object-cover scale-[1.08]'

function isYouTubeId(value: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(value)
}

function extractYouTubeId(value: string): string {
  const candidate = value.trim()
  if (isYouTubeId(candidate)) return candidate

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|vi\/))([A-Za-z0-9_-]{11})/,
    /\/vi\/([A-Za-z0-9_-]{11})\//,
  ]
  for (const pattern of patterns) {
    const match = candidate.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
}

function findYouTubeId(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (!value) continue
    const id = extractYouTubeId(value)
    if (id) return id
  }
  return ''
}

function driveId(url: string): string {
  const match = url.match(/\/d\/([A-Za-z0-9_-]{10,})/) || url.match(/[?&]id=([A-Za-z0-9_-]{10,})/)
  return match?.[1] ?? ''
}

/**
 * Shows a visible frame for YouTube, Google Drive and MP4 sources without
 * loading a full player. YouTube starts on hqdefault and only falls back to
 * mqdefault if that image fails to load.
 */
export function VideoThumbnail({ src, alt, className = 'aspect-video w-full', videoId }: Props) {
  const id = findYouTubeId(videoId, src)
  const fileId = id ? '' : driveId(src)
  const isMp4 = /\.mp4(?:[?#]|$)/i.test(src)
  const initialImage = id
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : fileId
      ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
      : ''
  const [imageSource, setImageSource] = useState(initialImage)
  const [usedFallback, setUsedFallback] = useState(false)

  useEffect(() => {
    setUsedFallback(false)
    setImageSource(initialImage)
  }, [initialImage])

  if (isMp4) {
    return (
      <div className={`overflow-hidden bg-black ${className}`}>
        <video
          src={`${src}${src.includes('#') ? '' : '#t=1.5'}`}
          preload="metadata"
          muted
          playsInline
          className={imageClass}
          aria-label={alt}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget
            if (Number.isFinite(video.duration)) video.currentTime = Math.min(1.5, video.duration)
          }}
        />
      </div>
    )
  }

  if (id) {
    return (
      <div className={`overflow-hidden bg-black ${className}`}>
        <img
          src={imageSource}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={imageClass}
          onError={() => {
            if (usedFallback) return
            setUsedFallback(true)
            setImageSource(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`)
          }}
        />
      </div>
    )
  }

  if (!imageSource) {
    return <div className={`soft-panel !rounded-none ${className}`} aria-label={alt} />
  }

  return (
    <div className={`overflow-hidden bg-black ${className}`}>
      <img
        src={imageSource}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={imageClass}
        onError={() => setImageSource('')}
      />
    </div>
  )
}
