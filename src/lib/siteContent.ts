import {
  createCommunityComment,
  createCommunityPost,
  getAnnouncementsEvents,
  getAudios,
  getCommunity,
} from './sheetApi'
import type {
  AudioSession,
  CommunityComment,
  CommunityPost,
  CommunityPostInput,
  CommunityReply,
  CommunityReplyInput,
  SundayCheckinInput,
} from '../types'

export type SiteFeed<T> = {
  rows: T[]
  unconfigured: boolean
}

async function post(payload: Record<string, unknown>): Promise<{ error?: string }> {
  const response = await fetch('/api/site', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok || data.error) throw new Error(data.error ?? 'The sheet is unavailable.')
  return data
}

export async function fetchPosts(): Promise<SiteFeed<CommunityPost>> {
  const data = await getCommunity()
  return { rows: data.posts, unconfigured: data.source === 'unconfigured' }
}

export async function fetchReplies(parentPostId?: string): Promise<SiteFeed<CommunityReply>> {
  const data = await getCommunity()
  const rows = parentPostId
    ? data.comments.filter((comment) => comment.parent_post_id === parentPostId)
    : data.comments
  return { rows, unconfigured: data.source === 'unconfigured' }
}

export async function fetchAudioSessions(): Promise<SiteFeed<AudioSession>> {
  const data = await getAudios()
  return { rows: data.audios, unconfigured: data.source === 'unconfigured' }
}

export async function createPost(input: CommunityPostInput): Promise<CommunityPost> {
  return createCommunityPost(input)
}

export async function createReply(input: CommunityReplyInput): Promise<CommunityReply> {
  return createCommunityComment(input)
}

export async function submitCheckin(input: SundayCheckinInput): Promise<void> {
  await post({ action: 'checkin_create', ...input })
}

/* Legacy helpers kept so older sections keep working during rollout. */

export async function fetchComments(): Promise<SiteFeed<CommunityComment>> {
  const data = await getCommunity()
  return {
    rows: data.comments.map((comment) => ({
      id: comment.id ?? comment.comment_id,
      name: comment.name,
      message: comment.message ?? comment.comment_text,
      created_at: comment.created_at ?? comment.timestamp,
    })),
    unconfigured: data.source === 'unconfigured',
  }
}

export async function postComment(input: { name: string; message: string }): Promise<CommunityComment> {
  const saved = await createCommunityComment({
    parent_post_id: '',
    name: input.name,
    comment_text: input.message,
  })
  return {
    id: saved.id ?? saved.comment_id,
    name: saved.name,
    message: saved.comment_text ?? saved.message ?? '',
    created_at: saved.timestamp,
  }
}

export async function fetchAnnouncements() {
  const data = await getAnnouncementsEvents()
  return { rows: data.announcements, unconfigured: data.source === 'unconfigured' }
}

export async function fetchEvents() {
  const data = await getAnnouncementsEvents()
  return { rows: data.events, unconfigured: data.source === 'unconfigured' }
}

export async function createAnnouncement(
  input: { title: string; body: string; date: string; is_pinned: boolean },
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
