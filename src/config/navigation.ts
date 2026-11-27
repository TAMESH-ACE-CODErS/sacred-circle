import type { NavItem } from '../types'
import type { TranslationKey } from '../i18n/translations'

/**
 * The homepage is a long, single story. These are the sections the sticky
 * navbar follows with IntersectionObserver, in reading order.
 */
export const siteSections = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'sunday', labelKey: 'nav.sunday' },
  { id: 'videos', labelKey: 'nav.youtube' },
  { id: 'quotes', labelKey: 'nav.quotes' },
  { id: 'materials', labelKey: 'nav.materials' },
  { id: 'reviews', labelKey: 'nav.reviews' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const satisfies readonly { id: string; labelKey: TranslationKey }[]

export type SectionId = (typeof siteSections)[number]['id']

export const routeSectionMap: Record<string, SectionId> = {
  '/': 'home',
  '/about': 'about',
  '/sunday-meditation': 'sunday',
  '/materials': 'materials',
  '/reviews': 'reviews',
  '/community': 'contact',
}

// Supabase `site_settings.nav_headers` can still override the footer links.
export const defaultNavItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Sunday Meditation', href: '/sunday-meditation' },
  { label: 'Materials', href: '/materials' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Community', href: '/community' },
]

export function normalizeNavItems(value: unknown): NavItem[] {
  if (!Array.isArray(value)) return defaultNavItems
  const items = value
    .filter((item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === 'object',
    )
    .map((item) => ({
      label: typeof item.label === 'string' ? item.label : '',
      href: typeof item.href === 'string' ? item.href : '',
    }))
    .filter((item) => item.label && item.href)
  return items.length ? items : defaultNavItems
}
