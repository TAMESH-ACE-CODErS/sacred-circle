import { useEffect, useState } from 'react'
import { ClipboardCheck, ExternalLink } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { CONNECT_FORM_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'

const SUBMITTED_KEY = 'sc_connect_submitted'
const DISMISSED_KEY = 'sc_connect_dismissed_at'
const SEVEN_DAYS_MS = 604800000
const SHOW_DELAY_MS = 4000

type Props = {
  /** True only after the intro has been dismissed and the main site is visible. */
  enabled: boolean
}

export function ConnectPrompt({ enabled }: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    if (!enabled) return
    if (window.localStorage.getItem(SUBMITTED_KEY) === 'true') return

    const dismissed = Number(window.localStorage.getItem(DISMISSED_KEY) ?? 0)
    if (Number.isFinite(dismissed) && Date.now() - dismissed < SEVEN_DAYS_MS) return
    if (dismissed) window.localStorage.removeItem(DISMISSED_KEY)

    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [enabled])

  function fillForm(): void {
    window.localStorage.setItem(SUBMITTED_KEY, 'true')
    window.localStorage.removeItem(DISMISSED_KEY)
    setOpen(false)
    window.open(CONNECT_FORM_URL, '_blank', 'noopener,noreferrer')
  }

  function notNow(): void {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setOpen(false)
  }

  return (
    <BottomSheet
      open={open}
      onClose={notNow}
      title={t('connect.title')}
      titleId="connect-prompt-title"
    >
      <p className="text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
        {t('connect.body')}
      </p>
      <div className="mt-7 flex flex-col gap-4">
        <button type="button" className="btn-primary w-full !min-h-[56px]" onClick={fillForm}>
          <ClipboardCheck size={20} aria-hidden="true" />
          {t('connect.accept')}
          <ExternalLink size={18} aria-hidden="true" />
        </button>
        <button type="button" className="btn-secondary w-full !min-h-[56px]" onClick={notNow}>
          {t('connect.dismiss')}
        </button>
      </div>
    </BottomSheet>
  )
}
