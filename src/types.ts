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

export type ContactLinks = {
  youtube: string
  whatsapp: string
  email: string
}
