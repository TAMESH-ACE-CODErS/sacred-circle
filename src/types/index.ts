export type { YouTubeFeed, YouTubeVideo } from './youtube'
export type {
  AnnouncementEventFeed,
  AudioInput,
  AudioPinResult,
  AudioSession,
  CommunityFeed,
  CommunityPost,
  CommunityPostInput,
  CommunityReply,
  CommunityReplyInput,
  DeviceType,
  LanguageCode,
  SundayCheckinInput,
  VisitorEvent,
  VisitorEventType,
} from './sheet'

export type NavItem = {
  label: string
  href: string
}

export type Announcement = {
  id: string
  message_en: string
  message_hi: string | null
  link_url: string | null
  is_active: boolean
  event_date: string | null
}

export type Material = {
  id: string
  title: string
  description: string
  media_type: 'video' | 'audio'
  media_url: string | null
  thumbnail_url: string
  category: string
  is_locked: boolean
  created_at?: string
}

export type Review = {
  id: string
  reviewer_name: string
  review_text: string
  avatar_key: 'reviewerM' | 'reviewerF' | 'reviewerMF'
  sort_order: number
}

export type QuoteCategory = 'quote' | 'opinion' | 'reflection'
export type QuoteStatus = 'published' | 'hidden'

export type CommunityQuote = {
  id: string
  timestamp: string
  author_name: string
  category: QuoteCategory
  content: string
  status: QuoteStatus
}

export type ContactLinks = {
  youtube: string
  whatsapp: string
  email: string
}

export type CommunityComment = {
  id?: string
  name: string
  message: string
  created_at: string
}

export type SheetAnnouncement = {
  id: string
  title: string
  body: string
  date: string
  is_pinned: boolean
}

export type SheetEvent = {
  id: string
  title: string
  date: string
  time: string
  location_or_link: string
  description: string
}
