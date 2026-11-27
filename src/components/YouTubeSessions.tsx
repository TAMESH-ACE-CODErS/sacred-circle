import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Play, X } from 'lucide-react'
import type { YouTubeFeed, YouTubeVideo } from '../../api/youtube'
import { YOUTUBE_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { setVideoStructuredData } from '../lib/structuredData'
import { SectionHeading } from './SectionHeading'

export function YouTubeSessions() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const [active, setActive] = useState<YouTubeVideo | null>(null)
  const { t, language } = useLanguage()

  useEffect(() => {
    let cancelled = false
    fetch('/api/youtube')
      .then((response) => {
        if (!response.ok) throw new Error('Feed unavailable')
        return response.json() as Promise<YouTubeFeed>
      })
      .then((data) => {
        if (cancelled) return
        setVideos(data.videos ?? [])
        setStatus(data.videos?.length ? 'ready' : 'unavailable')
        if (data.videos?.length) setVideoStructuredData(data.videos)
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active])

  return (
    <section id="videos" className="section-shell !pt-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow={t('videos.eyebrow')}
          title={t('videos.title')}
          description={t('videos.description')}
        />
        <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" className="btn-secondary shrink-0">
          {t('videos.visitChannel')} <ExternalLink size={18} />
        </a>
      </div>

      {status === 'loading' && (
        <p className="soft-panel mt-10 text-center text-lg" role="status" aria-live="polite">
          {t('videos.loading')}
        </p>
      )}

      {status === 'unavailable' && (
        <div className="soft-panel mt-10 text-center">
          <p className="text-lg">{t('videos.unavailable')}</p>
          <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" className="btn-primary mt-6">
            {t('videos.openChannel')}
          </a>
        </div>
      )}

      {status === 'ready' && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, 6).map((video) => (
            <article key={video.videoId} className="card overflow-hidden !p-0">
              <button
                type="button"
                onClick={() => setActive(video)}
                className="group block w-full text-left"
                aria-label={`${t('videos.play')} ${video.title}`}
              >
                <span className="relative block aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={`${t('videos.thumbnailAlt')} ${video.title}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className="absolute inset-0 grid place-items-center"
                    style={{ background: 'rgba(20, 17, 15, 0.24)' }}
                    aria-hidden="true"
                  >
                    <span
                      className="grid h-16 w-16 place-items-center rounded-full"
                      style={{ background: 'rgba(255, 253, 248, 0.94)', color: '#77593C' }}
                    >
                      <Play size={28} fill="currentColor" />
                    </span>
                  </span>
                </span>
                <span className="block p-6">
                  <span className="line-clamp-2 block text-lg font-semibold leading-snug">
                    {video.title}
                  </span>
                  <span className="mt-3 block text-base" style={{ color: 'var(--muted)' }}>
                    {new Date(video.publishedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </button>
            </article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ background: 'rgba(18, 15, 34, 0.85)' }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActive(null)
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              className="w-full max-w-5xl rounded-3xl border p-3 sm:p-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4 px-2 pb-4">
                <h3 className="text-xl sm:text-2xl">{active.title}</h3>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="inline-flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full"
                  style={{ color: 'var(--muted)' }}
                  aria-label={t('videos.close')}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${active.videoId}?autoplay=1&rel=0`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <a
                href={active.url}
                target="_blank"
                rel="noreferrer"
                className="btn-link mt-4 !min-h-[48px] px-2"
              >
                {t('videos.watch')} <ExternalLink size={18} />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
