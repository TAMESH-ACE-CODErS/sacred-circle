import { useEffect, useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
}

const imageClass = 'h-full w-full object-cover scale-[1.08]'
const FALLBACK_WIDTH = 120

function youtubeId(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0]
    if (parsed.hostname.endsWith('youtube.com')) {
      const embed = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]+)/)
      if (embed) return embed[1]
      return parsed.searchParams.get('v') ?? ''
    }
  } catch {
    return ''
  }
  return ''
}

function driveId(url: string): string {
  const match = url.match(/\/d\/([A-Za-z0-9_-]{10,})/) || url.match(/[?&]id=([A-Za-z0-9_-]{10,})/)
  return match?.[1] ?? ''
}

/**
 * Shows a visible frame for YouTube, Google Drive and MP4 sources without
 * loading a full player. The 120px guard catches YouTube's missing-image tile.
 */
export function VideoThumbnail({ src, alt, className = 'aspect-video w-full' }: Props) {
  const [imageSource, setImageSource] = useState('')
  const [usedFallback, setUsedFallback] = useState(false)

  const id = youtubeId(src)
  const fileId = id ? '' : driveId(src)
  const isMp4 = /\.mp4(?:[?#]|$)/i.test(src)

  useEffect(() => {
    setUsedFallback(false)
    if (id) setImageSource(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
    else if (fileId) setImageSource(`https://drive.google.com/thumbnail?id=${fileId}&sz=w800`)
    else setImageSource('')
  }, [id, fileId])

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

  if (!imageSource) {
    return <div className={`soft-panel !rounded-none ${className}`} aria-label={alt} />
  }

  return (
    <div className={`overflow-hidden bg-black ${className}`}>
      <img
        src={imageSource}
        alt={alt}
        loading="lazy"
        className={imageClass}
        onLoad={(event) => {
          if (!id || usedFallback) return
          if (event.currentTarget.naturalWidth <= FALLBACK_WIDTH) {
            setUsedFallback(true)
            setImageSource(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)
          }
        }}
        onError={() => {
          if (!id || usedFallback) return
          setUsedFallback(true)
          setImageSource(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)
        }}
      />
    </div>
  )
}
