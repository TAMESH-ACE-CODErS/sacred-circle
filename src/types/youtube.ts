export type YouTubeVideo = {
  videoId: string
  title: string
  thumbnail: string
  publishedAt: string
  url: string
}

export type YouTubeFeed = {
  videos: YouTubeVideo[]
  channelId: string
  fetchedAt: string
  source: 'rss' | 'fallback'
}
