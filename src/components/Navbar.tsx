import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Languages, Menu, MessageCircle, X } from 'lucide-react'
import { siteSections } from '../config/navigation'
import { WHATSAPP_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { ChakraToggle } from './ChakraToggle'

export function Navbar() {
  const { t, language, toggleLanguage } = useLanguage()
  const activeSection = useScrollSpy()
  const { pathname, hash } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const activeKey =
    pathname === '/admin' ? 'nav.admin' : siteSections.find((section) => section.id === activeSection)?.labelKey ?? 'nav.home'
  const activeLabel = t(activeKey)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--border)' }}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-5 py-2 sm:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="flex min-h-[52px] shrink-0 items-center gap-2"
          aria-label={`${t('common.brand')} — ${t('nav.home')}`}
        >
          <img src="/favicon.svg" alt="" className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
          <span className="hidden font-display text-lg tracking-tight sm:inline sm:text-2xl">
            {t('common.brand')}
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex min-h-[52px] min-w-[52px] items-center justify-center gap-2 rounded-full px-3 text-base font-semibold shadow-calm sm:px-5"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
            aria-label={`${t('common.translate')} — ${language === 'en' ? 'English' : 'हिन्दी'}. ${language === 'en' ? 'हिन्दी' : 'English'}`}
            title={t('common.translate')}
          >
            <Languages size={20} aria-hidden="true" />
            <span className="hidden sm:inline">English / हिन्दी</span>
            <span className="sm:hidden">{language === 'en' ? 'HI' : 'EN'}</span>
          </button>
          <ChakraToggle />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full border px-4 text-base font-semibold lg:hidden"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            <Menu size={20} aria-hidden="true" />
            <span>{t('nav.menu')}</span>
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-primary hidden !px-5 !text-base xl:inline-flex"
          >
            {t('common.joinFreeSession')}
          </a>
        </div>
      </nav>

      <div className="hidden border-t lg:block" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex gap-1 overflow-x-auto py-1" role="navigation" aria-label={t('common.currentSection')}>
            {siteSections.map((section) => {
              const isActive = pathname === '/' && activeSection === section.id
              return (
                <Link
                  key={section.id}
                  to={`/#${section.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`inline-flex min-h-[48px] shrink-0 items-center rounded-full px-4 text-base transition-colors ${
                    isActive ? 'font-bold underline decoration-2 underline-offset-4' : 'font-medium hover:opacity-75'
                  }`}
                  style={{
                    color: isActive ? 'var(--accent-strong)' : 'var(--text)',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  {t(section.labelKey)}
                </Link>
              )
            })}
            <Link
              to="/admin"
              aria-current={pathname === '/admin' ? 'page' : undefined}
              className={`inline-flex min-h-[48px] shrink-0 items-center rounded-full px-4 text-base transition-colors ${
                pathname === '/admin' ? 'font-bold underline decoration-2 underline-offset-4' : 'font-medium hover:opacity-75'
              }`}
              style={{
                color: pathname === '/admin' ? 'var(--accent-strong)' : 'var(--text)',
                background: pathname === '/admin' ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              {t('nav.admin')}
            </Link>
          </div>
        </div>
      </div>

      <div
        className="flex min-h-[32px] items-center gap-2 px-5 py-1 text-base font-semibold lg:hidden"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--accent-strong)' }}
        aria-live="polite"
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--accent-strong)' }} aria-hidden="true" />
        <span className="truncate">{t('common.currentSection')}: {activeLabel}</span>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.25 }}
          >
            <button
              type="button"
              className="absolute inset-0 h-full w-full cursor-default"
              style={{ background: 'rgba(18, 15, 34, 0.68)' }}
              onClick={() => setDrawerOpen(false)}
              aria-label={t('nav.closeMenu')}
            />

            <motion.aside
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu')}
              className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-y-auto px-5 py-6"
              style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: reducedMotion ? 0.01 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow !mb-1">{t('common.brand')}</p>
                  <h2 className="!text-2xl">{t('nav.menu')}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex min-h-[52px] min-w-[52px] shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  aria-label={t('nav.closeMenu')}
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <p className="mt-3 text-base font-semibold" style={{ color: 'var(--accent-strong)' }}>
                {t('common.currentSection')}: {activeLabel}
              </p>

              <nav className="mt-8 flex flex-col gap-2" aria-label={t('nav.menu')}>
                {siteSections.map((section) => {
                  const isActive = pathname === '/' && activeSection === section.id
                  return (
                    <Link
                      key={section.id}
                      to={`/#${section.id}`}
                      onClick={() => setDrawerOpen(false)}
                      aria-current={isActive ? 'location' : undefined}
                      className="flex min-h-[56px] items-center rounded-2xl px-4 text-lg font-semibold"
                      style={{
                        color: isActive ? 'var(--accent-strong)' : 'var(--text)',
                        background: isActive ? 'var(--accent-soft)' : 'transparent',
                      }}
                    >
                      {t(section.labelKey)}
                    </Link>
                  )
                })}
                <Link
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  aria-current={pathname === '/admin' ? 'page' : undefined}
                  className="flex min-h-[56px] items-center rounded-2xl px-4 text-lg font-semibold"
                  style={{
                    color: pathname === '/admin' ? 'var(--accent-strong)' : 'var(--text)',
                    background: pathname === '/admin' ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  {t('nav.admin')}
                </Link>
              </nav>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-8 w-full"
                onClick={() => setDrawerOpen(false)}
              >
                <MessageCircle size={19} aria-hidden="true" />
                {t('common.joinFreeSession')}
              </a>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
