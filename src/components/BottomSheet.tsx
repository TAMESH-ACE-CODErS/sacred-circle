import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  titleId: string
  children: ReactNode
  /** The intro is the only overlay that must not close on a backdrop tap. */
  allowBackdropClose?: boolean
}

/** A thumb-friendly sheet: anchored to the bottom on phones, centred on larger screens. */
export function BottomSheet({
  open,
  onClose,
  title,
  titleId,
  children,
  allowBackdropClose = true,
}: Props) {
  const reducedMotion = useReducedMotion()
  const { t } = useLanguage()

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.22 }}
          style={{ background: 'rgba(14, 11, 20, 0.66)' }}
          onMouseDown={(event) => {
            if (allowBackdropClose && event.target === event.currentTarget) onClose()
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[2rem] sm:p-8"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            initial={{ y: reducedMotion ? 0 : '100%', opacity: reducedMotion ? 0 : 1, scale: 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: reducedMotion ? 0 : '100%', opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-1 flex justify-center sm:hidden" aria-hidden="true">
              <span className="h-1.5 w-14 rounded-full" style={{ background: 'var(--border)' }} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="!text-2xl sm:!text-3xl">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[52px] shrink-0 items-center gap-2 rounded-full border px-4 text-base font-semibold"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                aria-label={t('common.close')}
              >
                <X size={20} aria-hidden="true" />
                <span>{t('common.close')}</span>
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
