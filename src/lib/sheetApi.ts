import type {
  AnnouncementEventFeed,
  AudioInput,
  AudioPinResult,
  AudioSession,
  CommunityFeed,
  CommunityPost,
  CommunityPostInput,
  CommunityReply,
  CommunityReplyInput,
  SheetAnnouncement,
  SheetEvent,
} from '../types/sheet'

type SitePayload = {
  ok?: boolean
  error?: string
  source?: string
  audios?: AudioSession[]
  sessions?: AudioSession[]
  posts?: CommunityPost[]
  comments?: CommunityReply[]
  announcements?: SheetAnnouncement[]
  events?: SheetEvent[]
  post?: CommunityPost
  comment?: CommunityReply
  audio_preview_url?: string
  title?: string
}

async function get(action: string, params: Record<string, string> = {}): Promise<SitePayload> {
  const query = new URLSearchParams({ action, ...params })
  const response = await fetch(`/api/site?${query.toString()}`)
  const data = (await response.json().catch(() => ({}))) as SitePayload
  if (!response.ok || data.error) throw new Error(data.error ?? 'The sheet is unavailable.')
  return data
}

async function send(payload: Record<string, unknown>): Promise<SitePayload> {
  const response = await fetch('/api/site', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await response.json().catch(() => ({}))) as SitePayload
  if (!response.ok || data.error) throw new Error(data.error ?? 'The sheet is unavailable.')
  return data
}

export async function getAudios(): Promise<{ ok: boolean; audios: AudioSession[]; source?: string }> {
  const data = await get('get_audios')
  return {
    ok: data.ok !== false,
    audios: data.audios ?? data.sessions ?? [],
    source: data.source,
  }
}

export async function getCommunity(): Promise<CommunityFeed> {
  const data = await get('get_community')
  return {
    ok: data.ok !== false,
    posts: data.posts ?? [],
    comments: data.comments ?? [],
    source: data.source,
  }
}

export async function getAnnouncementsEvents(): Promise<AnnouncementEventFeed> {
  const data = await get('get_announcements_events')
  return {
    ok: data.ok !== false,
    announcements: data.announcements ?? [],
    events: data.events ?? [],
    source: data.source,
  }
}

export async function verifyAudioPin(id: string, pin: string): Promise<AudioPinResult> {
  const data = await send({ action: 'verify_audio_pin', id, pin })
  return {
    ok: data.ok !== false,
    audio_preview_url: data.audio_preview_url ?? '',
    title: data.title,
  }
}

export async function createCommunityPost(input: CommunityPostInput): Promise<CommunityPost> {
  const data = await send({ action: 'create_post', ...input })
  if (!data.post) throw new Error('The post was not saved.')
  return data.post
}

export async function createCommunityComment(input: CommunityReplyInput): Promise<CommunityReply> {
  const data = await send({ action: 'create_comment', ...input })
  if (!data.comment) throw new Error('The reply was not saved.')
  return data.comment
}

export async function upsertAudio(input: AudioInput, adminKey: string): Promise<void> {
  await send({ action: 'upsert_audio', adminKey, ...input })
}

export async function deleteSheetRow(sheetName: string, id: string, adminKey: string): Promise<void> {
  await send({ action: 'delete_row', adminKey, sheetName, id })
}
