import { useCallback, useEffect, useState } from 'react'
import { Clock, MapPin } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { fetchEvents } from '../lib/siteContent'
import type { SheetEvent } from '../types'

export function EventsSection() {
  const { t } = useLanguage()
  const [rows, setRows] = useState<SheetEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [unconfigured, setUnconfigured] = useState(false)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setFailed(false)
    try {
      const feed = await fetchEvents()
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
    <section id="events" className="section-shell !pt-12">
      <SectionHeading
        eyebrow={t('events.eyebrow')}
        title={t('events.title')}
        description={t('events.description')}
        centered
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-2" aria-live="polite">
        {loading && <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('events.loading')}</p>}
        {!loading && failed && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('events.error')}</p>
        )}
        {!loading && !failed && unconfigured && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('events.unconfigured')}</p>
        )}
        {!loading && !failed && !unconfigured && rows.length === 0 && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>{t('events.empty')}</p>
        )}

        {!failed && !unconfigured && rows.map((row) => {
          const isLink = /^https?:\/\//i.test(row.location_or_link)
          return (
            <article key={row.id} className="card flex flex-col !p-6 sm:!p-8">
              <p className="text-base font-semibold" style={{ color: 'var(--accent-strong)' }}>{row.date}</p>
              <h3 className="mt-2 font-display text-2xl">{row.title}</h3>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-base" style={{ color: 'var(--muted)' }}>
                <span className="inline-flex items-center gap-2">
                  <Clock size={18} aria-hidden="true" />
                  {t('events.time')}: {row.time || '2 Hrs'}
                </span>
                {row.location_or_link && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={18} aria-hidden="true" />
                    {isLink ? (
                      <a href={row.location_or_link} target="_blank" rel="noreferrer" className="underline">
                        {t('events.onlineLink')}
                      </a>
                    ) : (
                      row.location_or_link
                    )}
                  </span>
                )}
              </div>
              {row.description && (
                <p className="mt-4 flex-1 whitespace-pre-wrap text-lg leading-relaxed">{row.description}</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
