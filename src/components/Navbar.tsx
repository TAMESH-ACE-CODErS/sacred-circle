import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Languages, Menu, MessageCircle, Moon, Sun, X } from 'lucide-react'
import { siteSections } from '../config/navigation'
import { WHATSAPP_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { useFontSize } from '../context/FontSizeContext'
import { useTheme } from '../context/ThemeContext'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { ChakraToggle } from './ChakraToggle'
import { trackVisitorEvent } from '../lib/sheetTracker'

export function Navbar() {
  const { t, language, toggleLanguage } = useLanguage()
  const { decrease, increase, canDecrease, canIncrease } = useFontSize()
  const { theme, toggleTheme } = useTheme()
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
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="flex min-h-[52px] shrink-0 items-center gap-2 text-lg font-bold tracking-tight sm:text-2xl"
          aria-label={`${t('common.brand')} — ${t('nav.home')}`}
        >
          <img src="/favicon.svg" alt="" className="hidden h-10 w-10 shrink-0 sm:block" />
          <span>{t('common.brand')}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
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
            onClick={() => trackVisitorEvent('whatsapp_click', { eventDetail: 'Top navigation' })}
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
              className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-y-auto px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
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
                  className="inline-flex min-h-[56px] shrink-0 items-center gap-2 rounded-full border px-4 text-base font-semibold"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                  aria-label={t('nav.closeMenu')}
                >
                  <X size={22} aria-hidden="true" />
                  <span>{t('common.close')}</span>
                </button>
              </div>

              <p className="mt-3 text-base font-semibold" style={{ color: 'var(--accent-strong)' }}>
                {t('common.currentSection')}: {activeLabel}
              </p>

              <nav className="mt-6 flex flex-col gap-2" aria-label={t('nav.menu')}>
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

              <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
                <p className="eyebrow !mb-3">{t('font.label')}</p>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-4 text-left text-lg font-semibold"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <Languages size={20} aria-hidden="true" />
                  <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
                </button>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={decrease}
                    disabled={!canDecrease}
                    className="inline-flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border px-4 text-lg font-bold disabled:opacity-45"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                    aria-label={t('font.decrease')}
                  >
                    A−
                  </button>
                  <button
                    type="button"
                    onClick={increase}
                    disabled={!canIncrease}
                    className="inline-flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border px-4 text-lg font-bold disabled:opacity-45"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                    aria-label={t('font.increase')}
                  >
                    A+
                  </button>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="mt-2 flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-4 text-left text-lg font-semibold"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
                  <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
                </button>
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-6 w-full !min-h-[56px]"
                onClick={() => {
                  trackVisitorEvent('whatsapp_click', { eventDetail: 'Mobile menu' })
                  setDrawerOpen(false)
                }}
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
