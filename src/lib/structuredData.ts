import type { YouTubeVideo } from '../../api/youtube'

const VIDEO_DATA_ID = 'sacred-circle-video-jsonld'

/** Adds fresh VideoObject markup for whatever the RSS feed currently returns. */
export function setVideoStructuredData(videos: YouTubeVideo[]): void {
  const existing = document.getElementById(VIDEO_DATA_ID)
  const script = existing ?? document.createElement('script')
  script.id = VIDEO_DATA_ID
  script.setAttribute('type', 'application/ld+json')
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': videos.slice(0, 6).map((video) => ({
      '@type': 'VideoObject',
      name: video.title,
      description: `A free Sacred Circle healing and meditation session with Diwakar Raipur and Lina Bhave. ${video.title}`,
      thumbnailUrl: video.thumbnail,
      uploadDate: video.publishedAt,
      contentUrl: video.url,
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
      publisher: { '@type': 'Organization', name: 'Sacred Circle' },
    })),
  })
  if (!existing) document.head.appendChild(script)
}
