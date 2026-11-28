import type { CommunityComment, SheetAnnouncement, SheetEvent } from '../types'

type SiteResponse = {
  comments?: CommunityComment[]
  announcements?: SheetAnnouncement[]
  events?: SheetEvent[]
  comment?: CommunityComment
  announcement?: SheetAnnouncement
  event?: SheetEvent
  error?: string
  source?: string
}

export type SiteFeed<T> = {
  rows: T[]
  unconfigured: boolean
}

async function readJson(response: Response): Promise<SiteResponse> {
  const data = (await response.json().catch(() => ({}))) as SiteResponse
  if (!response.ok || data.error) throw new Error(data.error ?? 'The community sheet is unavailable.')
  return data
}

async function list(action: string): Promise<SiteResponse> {
  return readJson(await fetch(`/api/site?action=${encodeURIComponent(action)}`))
}

function feed<T>(data: SiteResponse, key: 'comments' | 'announcements' | 'events'): SiteFeed<T> {
  return {
    rows: (Array.isArray(data[key]) ? data[key] : []) as T[],
    unconfigured: data.source === 'unconfigured',
  }
}

export async function fetchComments(): Promise<SiteFeed<CommunityComment>> {
  return feed<CommunityComment>(await list('list_comments'), 'comments')
}

export async function fetchAnnouncements(): Promise<SiteFeed<SheetAnnouncement>> {
  return feed<SheetAnnouncement>(await list('list_announcements'), 'announcements')
}

export async function fetchEvents(): Promise<SiteFeed<SheetEvent>> {
  return feed<SheetEvent>(await list('list_events'), 'events')
}

async function post(payload: Record<string, unknown>): Promise<SiteResponse> {
  return readJson(
    await fetch('/api/site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
}

export async function postComment(input: {
  name: string
  message: string
}): Promise<CommunityComment> {
  const data = await post({ action: 'comment_create', ...input })
  if (!data.comment) throw new Error('The message was not saved.')
  return data.comment
}

export async function createAnnouncement(
  input: {
    title: string
    body: string
    date: string
    is_pinned: boolean
  },
  adminPin: string,
): Promise<void> {
  await post({ action: 'announcement_create', adminPin, ...input })
}

export async function deleteAnnouncement(id: string, adminPin: string): Promise<void> {
  await post({ action: 'announcement_delete', adminPin, id })
}

export async function createEvent(
  input: {
    title: string
    date: string
    time: string
    location_or_link: string
    description: string
  },
  adminPin: string,
): Promise<void> {
  await post({ action: 'event_create', adminPin, ...input })
}

export async function deleteEvent(id: string, adminPin: string): Promise<void> {
  await post({ action: 'event_delete', adminPin, id })
}
