import { MessageCircle, Youtube } from 'lucide-react'
import { WHATSAPP_URL, YOUTUBE_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'

/** Large labelled shortcuts — never icon-only circles. */
export function FloatingActions() {
  const { t } = useLanguage()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex items-end justify-between gap-2 px-3 sm:bottom-6 sm:px-6">
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto inline-flex min-h-[52px] min-w-0 max-w-[46%] items-center gap-1.5 rounded-full px-3 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:max-w-none sm:gap-2 sm:px-6"
        style={{ background: '#C62828', boxShadow: '0 10px 30px -12px rgba(120, 20, 20, 0.75)' }}
        aria-label={t('floating.youtube')}
      >
        <Youtube size={20} className="shrink-0 sm:h-[22px] sm:w-[22px]" fill="currentColor" aria-hidden="true" />
        <span className="truncate">{t('floating.youtube')}</span>
      </a>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto inline-flex min-h-[52px] min-w-0 max-w-[46%] items-center gap-1.5 rounded-full px-3 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:max-w-none sm:gap-2 sm:px-6"
        style={{ background: '#0B7A5B', boxShadow: '0 10px 30px -12px rgba(10, 90, 65, 0.75)' }}
        aria-label={t('floating.whatsapp')}
      >
        <MessageCircle size={20} className="shrink-0 sm:h-[22px] sm:w-[22px]" aria-hidden="true" />
        <span className="truncate">{t('floating.whatsapp')}</span>
      </a>
    </div>
  )
}
