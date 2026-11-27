import { MediaIcon } from './MediaIcon'

type Props = {
  url: string
  mediaType: string
  title: string
}

function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.endsWith('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return url
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch {
    return null
  }
  return null
}

export function MediaPlayer({ url, mediaType, title }: Props) {
  const embed = youtubeEmbedUrl(url)

  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        className="aspect-video w-full rounded-2xl border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    )
  }

  if (mediaType === 'audio') {
    return (
      <div className="soft-panel !p-5">
        <div className="mb-3 flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <MediaIcon mediaType="audio" />
          <span>Audio · keep the volume gentle</span>
        </div>
        <audio controls preload="none" className="w-full" src={url}>
          Your browser does not support audio playback.
        </audio>
      </div>
    )
  }

  return (
    <video
      controls
      preload="none"
      playsInline
      className="aspect-video w-full rounded-2xl bg-black"
      src={url}
    >
      Your browser does not support video playback.
    </video>
  )
}
