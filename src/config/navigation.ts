import type { NavItem } from '../types'
import type { TranslationKey } from '../i18n/translations'

/**
 * The homepage is a long, single story. These are the sections the sticky
 * navbar follows with IntersectionObserver, in reading order.
 */
export const siteSections = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'announcements', labelKey: 'nav.announcements' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'sunday', labelKey: 'nav.sunday' },
  { id: 'sunday-checkin', labelKey: 'nav.checkin' },
  { id: 'events', labelKey: 'nav.events' },
  { id: 'videos', labelKey: 'nav.youtube' },
  { id: 'comments', labelKey: 'nav.community' },
  { id: 'materials', labelKey: 'nav.library' },
  { id: 'audio', labelKey: 'nav.audio' },
  { id: 'reviews', labelKey: 'nav.reviews' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const satisfies readonly { id: string; labelKey: TranslationKey }[]

export type SectionId = (typeof siteSections)[number]['id']

export const routeSectionMap: Record<string, SectionId> = {
  '/': 'home',
  '/#home': 'home',
  '/#announcements': 'announcements',
  '/about': 'about',
  '/sunday-meditation': 'sunday',
  '/#sunday-checkin': 'sunday-checkin',
  '/#events': 'events',
  '/#videos': 'videos',
  '/community': 'comments',
  '/#comments': 'comments',
  '/materials': 'materials',
  '/#materials': 'materials',
  '/audio': 'audio',
  '/#audio': 'audio',
  '/reviews': 'reviews',
  '/#reviews': 'reviews',
  '/#contact': 'contact',
}

/** The nine required tabs. Extra Sunday/check-in links stay in the drawer. */
export const defaultNavItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Announcements', href: '/#announcements' },
  { label: 'Events', href: '/#events' },
  { label: 'Library', href: '/materials' },
  { label: 'Audio', href: '/audio' },
  { label: 'Community', href: '/community' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Admin', href: '/admin' },
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
