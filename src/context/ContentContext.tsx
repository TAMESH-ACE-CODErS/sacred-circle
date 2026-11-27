import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { normalizeNavItems } from '../config/navigation'
import { reviewSeeds } from '../config/reviews'
import { materialSeeds } from '../config/materials'
import { contactLinks, SUNDAY_SESSION_TIME, WHATSAPP_URL } from '../config/site'
import { supabase } from '../lib/supabase'
import type { Announcement, ContactLinks, Material, NavItem, Review } from '../types'

export type SiteContent = {
  announcements: Announcement[]
  reviews: Review[]
  materials: Material[]
  navItems: NavItem[]
  sundayTime: string
  contact: ContactLinks
}

type ContentContextValue = SiteContent & {
  refresh: () => Promise<void>
}

export const fallbackContent: SiteContent = {
  announcements: [
    {
      id: 'default-sunday',
      message_en: 'Free Sunday meditation — every Sunday at 4:00 PM IST. Everyone is welcome.',
      message_hi: 'हर रविवार शाम 4:00 बजे (IST) निःशुल्क ध्यान — सभी का स्वागत है।',
      link_url: WHATSAPP_URL,
      is_active: true,
      event_date: null,
    },
  ],
  reviews: reviewSeeds.map((r, i) => ({ ...r, id: `seed-review-${i}` })),
  materials: materialSeeds,
  navItems: normalizeNavItems(null),
  sundayTime: SUNDAY_SESSION_TIME,
  contact: contactLinks,
}

export const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(fallbackContent)

  const refresh = useCallback(async () => {
    if (!supabase) return

    const [settings, announcements, reviews, materials] = await Promise.all([
      supabase.from('site_settings').select('key,value'),
      supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('reviews')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('public_materials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false }),
    ])

    if (settings.error || announcements.error || reviews.error || materials.error) return

    const map = new Map((settings.data ?? []).map((row) => [row.key, row.value]))
    const links = map.get('contact_links') as Partial<ContactLinks> | undefined
    const sundayValue = map.get('sunday_session_time')

    setContent({
      announcements: (announcements.data ?? []) as Announcement[],
      reviews: (reviews.data ?? []) as Review[],
      materials: (materials.data ?? []) as Material[],
      navItems: normalizeNavItems(map.get('nav_headers')),
      sundayTime:
        typeof sundayValue === 'string' ? sundayValue : SUNDAY_SESSION_TIME,
      contact: { ...contactLinks, ...(links ?? {}) },
    })
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(() => ({ ...content, refresh }), [content, refresh])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
