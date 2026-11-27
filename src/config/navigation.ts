import type { NavItem } from '../types'

// Default navigation. Supabase `site_settings.nav_headers` overrides this
// at runtime, so founders can add or rename a page without a code change.
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
