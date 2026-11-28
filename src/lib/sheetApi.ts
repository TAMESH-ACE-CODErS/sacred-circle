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

/**
 * The deployed Apps Script web app is the default so the site works before any
 * local env file is created. `VITE_SHEET_API_URL` overrides it in every build.
 */
const DEPLOYED_SHEET_API_URL =
  'https://script.google.com/macros/s/AKfycbz-JRfwXkgh-RJwCirMU86PurG26AXnF0zbulnQkA45WVEbBlLhfMkaBfnRD_qS5kfi/exec'

function sheetApiUrl(): string {
  return (
    import.meta.env.VITE_SHEET_API_URL ||
    import.meta.env.VITE_SACRED_SHEET_URL ||
    DEPLOYED_SHEET_API_URL
  )
}

type RawAudio = AudioSession & {
  date?: string
  audio_preview_url?: string
  pin_code?: string
}

type SitePayload = {
  ok?: boolean
  success?: boolean
  error?: string
  source?: string
  audios?: RawAudio[]
  sessions?: RawAudio[]
  posts?: CommunityPost[]
  comments?: CommunityReply[]
  announcements?: SheetAnnouncement[]
  events?: SheetEvent[]
  post?: CommunityPost
  comment?: CommunityReply
  id?: string
  timestamp?: string
  audio_preview_url?: string
  title?: string
}

async function readResponse(response: globalThis.Response): Promise<SitePayload> {
  const text = await response.text()
  let data: SitePayload = {}
  try {
    data = (JSON.parse(text) ?? {}) as SitePayload
  } catch {
    // Apps Script can return an HTML error page; treat it as an empty payload.
  }
  if (!response.ok) throw new Error(data.error || `The sheet request failed (${response.status}).`)
  return data
}

function ensureOk(data: SitePayload): void {
  if (data.error) throw new Error(data.error)
  if (data.ok === false) throw new Error('The sheet request was not accepted.')
}

async function get(action: string, params: Record<string, string> = {}): Promise<SitePayload> {
  const url = new URL(sheetApiUrl())
  url.searchParams.set('action', action)
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  return readResponse(response)
}

/** `text/plain` keeps Apps Script POSTs simple requests, so no CORS preflight. */
function postRequestInit(payload: Record<string, unknown>): RequestInit {
  const adminValue = payload.adminKey ?? payload.adminPin
  const body =
    adminValue === undefined
      ? payload
      : { ...payload, adminKey: adminValue, adminPin: adminValue }
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  }
}

async function postRaw(payload: Record<string, unknown>): Promise<SitePayload> {
  const response = await fetch(sheetApiUrl(), postRequestInit(payload))
  return readResponse(response)
}

/** Visitor analytics must never block or interrupt the page. */
export function postToSheetFireAndForget(payload: Record<string, unknown>): void {
  try {
    void fetch(sheetApiUrl(), { ...postRequestInit(payload), keepalive: true }).catch(() => {
      // Tracking is best-effort only.
    })
  } catch {
    // Offline or privacy-blocked browsers are fine.
  }
}

/** Shared writer for check-ins and legacy admin actions. */
export async function postToSheet(payload: Record<string, unknown>): Promise<SitePayload> {
  const data = await postRaw(payload)
  ensureOk(data)
  return data
}

/** Maps both the current and deployed audio response shapes into one UI shape. */
function normaliseAudio(row: RawAudio): AudioSession {
  const isLocked = Boolean(row.is_locked || row.pin_code)
  const mediaUrl = isLocked ? '' : row.media_url || row.audio_preview_url || ''
  return {
    id: String(row.id ?? ''),
    title: String(row.title || 'Sunday Meditation'),
    description: String(row.description ?? ''),
    speaker: String(row.speaker || 'Lina Bhave & Diwakar Raipure'),
    duration: String(row.duration || '2 Hrs'),
    created_at: String(row.created_at || row.date || ''),
    media_url: mediaUrl,
    drive_url: String(row.drive_url ?? ''),
    is_locked: isLocked,
    status: row.status,
  }
}

export async function getAudios(): Promise<{ ok: boolean; audios: AudioSession[]; source?: string }> {
  const data = await get('get_audios')
  ensureOk(data)
  return {
    ok: data.ok !== false,
    audios: (data.audios ?? data.sessions ?? []).map(normaliseAudio),
    source: data.source,
  }
}

export async function getCommunity(): Promise<CommunityFeed> {
  const data = await get('get_community')
  ensureOk(data)
  return {
    ok: data.ok !== false,
    posts: data.posts ?? [],
    comments: data.comments ?? [],
    source: data.source,
  }
}

export async function getAnnouncementsEvents(): Promise<AnnouncementEventFeed> {
  const data = await get('get_announcements_events')
  ensureOk(data)
  return {
    ok: data.ok !== false,
    announcements: data.announcements ?? [],
    events: data.events ?? [],
    source: data.source,
  }
}

export async function verifyAudioPin(id: string, pin: string): Promise<AudioPinResult> {
  try {
    const data = await postRaw({ action: 'verify_audio_pin', id, pin, pin_code: pin })
    return {
      ok: data.ok !== false && Boolean(data.audio_preview_url),
      audio_preview_url: data.audio_preview_url ?? '',
      title: data.title,
      error: data.error,
    }
  } catch (error) {
    return {
      ok: false,
      audio_preview_url: '',
      error: error instanceof Error ? error.message : 'The sheet is unavailable.',
    }
  }
}

export async function createCommunityPost(input: CommunityPostInput): Promise<CommunityPost> {
  const data = await postRaw({ action: 'create_post', ...input })
  ensureOk(data)
  if (data.post) return data.post
  return {
    id: String(data.id ?? ''),
    timestamp: String(data.timestamp ?? new Date().toISOString()),
    name: input.name ?? '',
    post_text: input.post_text,
    city: input.city ?? '',
    profession_role: input.profession_role ?? '',
    interests: input.interests ?? '',
  }
}

export async function createCommunityComment(input: CommunityReplyInput): Promise<CommunityReply> {
  const data = await postRaw({ action: 'create_comment', ...input })
  ensureOk(data)
  if (data.comment) return data.comment
  return {
    comment_id: String(data.id ?? ''),
    parent_post_id: input.parent_post_id,
    timestamp: String(data.timestamp ?? new Date().toISOString()),
    name: input.name ?? '',
    comment_text: input.comment_text,
    city: input.city ?? '',
    profession_role: input.profession_role ?? '',
  }
}

export async function upsertAudio(input: AudioInput, adminKey: string): Promise<void> {
  await postToSheet({ action: 'upsert_audio', adminKey, ...input })
}

export async function deleteSheetRow(sheetName: string, id: string, adminKey: string): Promise<void> {
  await postToSheet({ action: 'delete_row', adminKey, sheetName, id })
}
