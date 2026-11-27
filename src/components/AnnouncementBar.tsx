import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useSiteContent } from '../hooks/useSiteContent'
import { WHATSAPP_URL } from '../config/site'

export function AnnouncementBar() {
  const { announcements, sundayTime } = useSiteContent()
  const announcement = announcements[0]
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('sc-announcement-dismissed') === 'yes')

  const messageEn = announcement?.message_en ?? `Free Sunday meditation — ${sundayTime}. Everyone is welcome.`
  const messageHi =
    announcement?.message_hi ?? 'हर रविवार निःशुल्क ध्यान — सभी का स्वागत है।'
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
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-3 text-center sm:px-8">
            <p className="text-sm font-medium sm:text-base" style={{ color: 'var(--text)' }}>
              {messageEn}
            </p>
            <p className="devanagari text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>
              {messageHi}
            </p>
            <a href={link} target="_blank" rel="noreferrer" className="btn-link !min-h-0 !text-sm">
              Details
            </a>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-1 rounded-full px-2 text-sm"
              style={{ color: 'var(--muted)' }}
              aria-label="Dismiss announcement"
              title="Dismiss announcement"
            >
              <X size={18} />
              <span className="hidden sm:inline">Dismiss</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
