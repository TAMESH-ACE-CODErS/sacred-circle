import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Languages, Menu, MessageCircle, Moon, Sun, X } from 'lucide-react'
import { publicNavSections } from '../config/navigation'
import { WHATSAPP_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { useFontSize } from '../context/FontSizeContext'
import { useTheme } from '../context/ThemeContext'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { AnnouncementBar } from './AnnouncementBar'
import { ChakraToggle } from './ChakraToggle'
import { trackVisitorEvent } from '../lib/sheetTracker'

export function Navbar() {
  const { t, toggleLanguage } = useLanguage()
  const { decrease, increase, canDecrease, canIncrease } = useFontSize()
  const { theme, toggleTheme } = useTheme()
  const activeSection = useScrollSpy()
  const { pathname, hash } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const headerRef = useRef<HTMLElement>(null)
  const activeKey = publicNavSections.find((section) => section.id === activeSection)?.labelKey ?? 'nav.home'
  const activeLabel = t(activeKey)

  // The header is fixed, so the page needs a matching top offset. The
  // announcement bar can be dismissed and changes height on small screens.
  useEffect(() => {
    const header = headerRef.current
    if (!header || typeof ResizeObserver === 'undefined') return
    const updateHeight = () => {
      document.documentElement.style.setProperty('--site-header-height', `${header.offsetHeight}px`)
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

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
      ref={headerRef}
      className="fixed left-0 right-0 top-0 z-40 border-b backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--border)' }}
    >
      <AnnouncementBar />
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-1 px-3 sm:gap-2 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="flex min-h-[52px] shrink-0 items-center gap-2 text-[15px] font-bold tracking-tight sm:text-base xl:text-xl"
          aria-label={`${t('common.brand')} — ${t('nav.home')}`}
        >
          <img src="/favicon.svg" alt="" className="h-9 w-9 shrink-0" />
          <span className="hidden whitespace-nowrap sm:inline">{t('common.brand')}</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
          {publicNavSections.map((section) => {
            const isActive = pathname === '/' && activeSection === section.id
            return (
              <Link
                key={section.id}
                to={`/#${section.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`inline-flex min-h-[48px] shrink-0 items-center whitespace-nowrap rounded-full px-1 py-2 text-[13px] transition-colors xl:px-2.5 xl:text-[15px] ${
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
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex min-h-[48px] items-center gap-1.5 rounded-full border px-2 text-[12px] font-bold sm:px-3 sm:text-sm xl:text-base"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
            aria-label={`${t('nav.language')}: English / हिन्दी`}
            title={`${t('nav.language')}: English / हिन्दी`}
          >
            <Languages size={18} aria-hidden="true" />
            <span className="whitespace-nowrap sm:hidden">EN / हि</span>
            <span className="hidden whitespace-nowrap sm:inline">English / हिन्दी</span>
          </button>
          <ChakraToggle />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={t('nav.menu')}
            className="inline-flex min-h-[48px] items-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold sm:px-4 sm:text-base lg:hidden"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            <Menu size={20} aria-hidden="true" />
            <span className="hidden whitespace-nowrap sm:inline">{t('nav.menu')}</span>
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
                {publicNavSections.map((section) => {
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
                  <span>English / हिन्दी</span>
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
