import { Link } from 'react-router-dom'
import { Home, LibraryBig, MessageCircle, Youtube } from 'lucide-react'
import { WHATSAPP_URL, YOUTUBE_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { trackVisitorEvent } from '../lib/sheetTracker'

/**
 * A thumb-reachable bottom dock on phones: Home, Library, YouTube, WhatsApp.
 * On larger screens the two external shortcuts stay as labelled floating pills.
 */
export function FloatingActions() {
  const { t } = useLanguage()

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t backdrop-blur-md sm:hidden"
        style={{
          background: 'color-mix(in srgb, var(--surface) 96%, transparent)',
          borderColor: 'var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label={t('dock.label')}
      >
        <Link
          to="/"
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-center text-sm font-semibold"
          style={{ color: 'var(--text)' }}
        >
          <Home size={22} aria-hidden="true" />
          <span>{t('dock.home')}</span>
        </Link>
        <Link
          to="/materials"
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-center text-sm font-semibold"
          style={{ color: 'var(--text)' }}
        >
          <LibraryBig size={22} aria-hidden="true" />
          <span>{t('dock.library')}</span>
        </Link>
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-center text-sm font-semibold text-white"
          style={{ background: '#C62828' }}
          onClick={() => trackVisitorEvent('youtube_click', { eventDetail: 'Bottom dock' })}
        >
          <Youtube size={22} fill="currentColor" aria-hidden="true" />
          <span>{t('dock.youtube')}</span>
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-center text-sm font-semibold text-white"
          style={{ background: '#0B7A5B' }}
          onClick={() => trackVisitorEvent('whatsapp_click', { eventDetail: 'Bottom dock' })}
        >
          <MessageCircle size={22} aria-hidden="true" />
          <span>{t('dock.whatsapp')}</span>
        </a>
      </nav>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 hidden items-end justify-between gap-2 px-6 sm:flex">
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto inline-flex min-h-[52px] items-center gap-2 rounded-full px-6 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ background: '#C62828', boxShadow: '0 10px 30px -12px rgba(120, 20, 20, 0.75)' }}
          aria-label={t('floating.youtube')}
          onClick={() => trackVisitorEvent('youtube_click', { eventDetail: 'Floating shortcut' })}
        >
          <Youtube size={22} fill="currentColor" aria-hidden="true" />
          {t('floating.youtube')}
        </a>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto inline-flex min-h-[52px] items-center gap-2 rounded-full px-6 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ background: '#0B7A5B', boxShadow: '0 10px 30px -12px rgba(10, 90, 65, 0.75)' }}
          aria-label={t('floating.whatsapp')}
          onClick={() => trackVisitorEvent('whatsapp_click', { eventDetail: 'Floating shortcut' })}
        >
          <MessageCircle size={22} aria-hidden="true" />
          {t('floating.whatsapp')}
        </a>
      </div>
    </>
  )
}
