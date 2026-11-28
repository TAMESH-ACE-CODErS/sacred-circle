export type LanguageCode = 'en' | 'hi'
export type DeviceType = 'mobile' | 'desktop'

export type VisitorEventType =
  | 'brochure_reaction'
  | 'brochure_card_tap'
  | 'reel_skipped'
  | 'sunday_cta_click'
  | 'whatsapp_click'
  | 'youtube_click'
  | 'audio_play'
  | 'video_play'

export type VisitorEvent = {
  event_id?: string
  timestamp?: string
  session_id: string
  event_type: VisitorEventType
  event_detail: string
  cards_viewed_count?: number
  time_on_brochure_sec?: number
  language: LanguageCode
  device_type: DeviceType
  referrer: string
}

export type SundayCheckinInput = {
  name?: string
  phone_whatsapp?: string
  email?: string
  city?: string
  age_group?: string
  profession_role?: string
  company_or_business?: string
  website_or_linkedin?: string
  interest_area?: string
  referral_source?: string
  open_to_connect?: boolean
  language?: LanguageCode
  device_type?: DeviceType
}

export type CommunityPostInput = {
  name?: string
  post_text: string
  email?: string
  phone_whatsapp?: string
  city?: string
  age_group?: string
  profession_role?: string
  company_or_business?: string
  website_or_linkedin?: string
  interests?: string
  referral_source?: string
  open_to_connect?: boolean
  language_used?: LanguageCode
  device_type?: DeviceType
}

/** Only safe display fields are ever returned by the public GET endpoint. */
export type CommunityPost = {
  id: string
  timestamp: string
  name: string
  post_text: string
  city: string
  profession_role: string
  interests: string
  status?: string
}

export type CommunityReplyInput = {
  parent_post_id: string
  name?: string
  comment_text: string
  email?: string
  phone_whatsapp?: string
  city?: string
  age_group?: string
  profession_role?: string
  company_or_business?: string
}

/** Only safe display fields are ever returned by the public GET endpoint. */
export type CommunityReply = {
  comment_id?: string
  id?: string
  parent_post_id: string
  timestamp: string
  /** Legacy alias used by the older single-comment feed. */
  created_at?: string
  name: string
  comment_text: string
  message?: string
  city: string
  profession_role: string
  status?: string
}

export type AudioSession = {
  id: string
  title: string
  description: string
  speaker: string
  duration: string
  created_at: string
  media_url: string
  drive_url: string
  drive_file_id?: string
  is_locked: boolean
  status?: string
}

export type AudioInput = {
  id?: string
  title: string
  description?: string
  speaker?: string
  duration?: string
  raw_drive_link?: string
  pin_code?: string
  status?: string
}

export type AudioPinResult = {
  ok: boolean
  audio_preview_url: string
  title?: string
  error?: string
}

export type CommunityFeed = {
  ok: boolean
  posts: CommunityPost[]
  comments: CommunityReply[]
  source?: string
}

export type AnnouncementEventFeed = {
  ok: boolean
  announcements: SheetAnnouncement[]
  events: SheetEvent[]
  source?: string
}

// Declared after the sheet-specific aliases to keep this module self-contained.
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
