/**
 * Zero-cost, key-free YouTube sync for @sacredcircle8336.
 * Runs as a Vercel Serverless Function; Vite serves the same handler in dev.
 */
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

const HANDLE_URL = 'https://www.youtube.com/@sacredcircle8336'
// Used only if YouTube changes the handle page markup.
const FALLBACK_CHANNEL_ID = 'UClsxKC6ApBFlB-bURTD0GbA'
const feedUrl = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&')
    .trim()
}

function first(xml: string, pattern: RegExp): string {
  return decodeXml(xml.match(pattern)?.[1] ?? '')
}

async function resolveChannelId(): Promise<string> {
  try {
    const page = await fetch(HANDLE_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SacredCircle/1.0)' },
    }).then((response) => response.text())
    const match =
      page.match(/channelId":"(UC[A-Za-z0-9_-]{22})"/) ??
      page.match(/externalId":"(UC[A-Za-z0-9_-]{22})"/)
    if (match?.[1]) return match[1]
  } catch {
    // Fall back to the known channel id below.
  }
  return FALLBACK_CHANNEL_ID
}

export async function getLatestVideos(limit = 9): Promise<YouTubeFeed> {
  const channelId = await resolveChannelId()
  const fetchedAt = new Date().toISOString()

  try {
    const xml = await fetch(feedUrl(channelId), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SacredCircle/1.0)' },
    }).then((response) => {
      if (!response.ok) throw new Error(`Feed status ${response.status}`)
      return response.text()
    })

    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []
    const videos = entries
      .slice(0, limit)
      .map((entry) => {
        const videoId = first(entry, /<yt:videoId>([\w-]+)<\/yt:videoId>/)
        return {
          videoId,
          title: first(entry, /<title>([\s\S]*?)<\/title>/),
          thumbnail:
            first(entry, /<media:thumbnail url="([^"]+)"/) ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          publishedAt: first(entry, /<published>([^<]+)<\/published>/),
          url: `https://www.youtube.com/watch?v=${videoId}`,
        }
      })
      .filter((video) => video.videoId && video.title)

    return { videos, channelId, fetchedAt, source: 'rss' }
  } catch {
    return { videos: [], channelId, fetchedAt, source: 'fallback' }
  }
}

type RequestLike = { method?: string }
type ResponseLike = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const data = await getLatestVideos()
  response.setHeader(
    'Cache-Control',
    data.source === 'rss'
      ? 'public, s-maxage=1800, stale-while-revalidate=3600'
      : 'public, s-maxage=60',
  )
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.status(200).json(data)
}
