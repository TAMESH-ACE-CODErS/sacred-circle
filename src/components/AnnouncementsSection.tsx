import { useCallback, useEffect, useState } from 'react'
import { Pin } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { fetchAnnouncements } from '../lib/siteContent'
import type { SheetAnnouncement } from '../types'

function formatDate(value: string, language: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function AnnouncementsSection() {
  const { t, language } = useLanguage()
  const [rows, setRows] = useState<SheetAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [unconfigured, setUnconfigured] = useState(false)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const feed = await fetchAnnouncements()
      setRows(feed.rows)
      setUnconfigured(feed.unconfigured)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section id="announcements" className="section-shell !pt-8">
      <SectionHeading
        eyebrow={t('announcements.eyebrow')}
        title={t('announcements.title')}
        description={t('announcements.description')}
        centered
      />

      <div className="mx-auto mt-10 max-w-4xl space-y-5" aria-live="polite">
        {loading && <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('announcements.loading')}</p>}
        {!loading && failed && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('announcements.error')}</p>
        )}
        {!loading && !failed && unconfigured && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('announcements.unconfigured')}</p>
        )}
        {!loading && !failed && !unconfigured && rows.length === 0 && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('announcements.empty')}</p>
        )}

        {!failed && !unconfigured && rows.map((row) => (
          <article key={row.id} className="card !p-6 sm:!p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-2xl">{row.title}</h3>
              {row.is_pinned && (
                <span
                  className="inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 text-sm font-semibold"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                >
                  <Pin size={16} aria-hidden="true" />
                  {t('announcements.pinned')}
                </span>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed">{row.body}</p>
            <p className="mt-4 text-base" style={{ color: 'var(--muted)' }}>
              {t('announcements.posted')} {formatDate(row.date, language)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
