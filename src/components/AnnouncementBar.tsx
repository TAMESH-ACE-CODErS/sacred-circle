import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useSiteContent } from '../hooks/useSiteContent'
import { useLanguage } from '../context/LanguageContext'
import { WHATSAPP_URL } from '../config/site'

export function AnnouncementBar() {
  const { announcements } = useSiteContent()
  const { language, t } = useLanguage()
  const announcement = announcements[0]
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('sc-announcement-dismissed') === 'yes',
  )

  const messageEn =
    announcement?.message_en ??
    'Free Weekly Sunday Meditation Session — Open to All | Join our WhatsApp Community →'
  const messageHi =
    announcement?.message_hi ??
    'हर रविवार निःशुल्क ध्यान सत्र — सभी के लिए खुला | हमारे WhatsApp समुदाय से जुड़ें →'
  const link = announcement?.link_url ?? WHATSAPP_URL

  const dismiss = () => {
    sessionStorage.setItem('sc-announcement-dismissed', 'yes')
    setDismissed(true)
  }

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="overflow-hidden"
          style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="relative mx-auto flex max-w-6xl items-center justify-center px-5 py-2 text-center sm:px-8 sm:py-3">
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[48px] items-center px-6 text-base font-semibold leading-snug underline decoration-1 underline-offset-4 hover:opacity-75 sm:px-12"
              style={{ color: 'var(--text)' }}
            >
              {language === 'hi' ? messageHi : messageEn}
            </a>
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-1 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-base sm:right-3"
              style={{ color: 'var(--muted)' }}
              aria-label={t('common.dismiss')}
              title={t('common.dismiss')}
            >
              <X size={20} />
              <span className="hidden sm:inline">{t('common.dismiss')}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
