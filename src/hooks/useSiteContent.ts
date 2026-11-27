import { useContext } from 'react'
import { ContentContext } from '../context/ContentContext'
import type { Announcement } from '../types'

export function useSiteContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useSiteContent must be used inside ContentProvider')
  return ctx
}

export function useAnnouncement(): Announcement | null {
  return useSiteContent().announcements[0] ?? null
}
