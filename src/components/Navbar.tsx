import { Link, useLocation } from 'react-router-dom'
import { Languages } from 'lucide-react'
import { siteSections } from '../config/navigation'
import { WHATSAPP_URL } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { ChakraToggle } from './ChakraToggle'

export function Navbar() {
  const { t, language, toggleLanguage } = useLanguage()
  const activeSection = useScrollSpy()
  const { pathname } = useLocation()
  const activeLabel = t(siteSections.find((section) => section.id === activeSection)?.labelKey ?? 'nav.home')

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--border)' }}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2 sm:px-8"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex min-h-[52px] items-center gap-3" aria-label={`${t('common.brand')} — ${t('nav.home')}`}>
          <img src="/favicon.svg" alt="" className="h-10 w-10 shrink-0" />
          <span className="font-display text-xl tracking-tight sm:text-2xl">{t('common.brand')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full px-3 text-sm font-semibold shadow-calm sm:px-5 sm:text-base"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
            aria-label={`${t('common.translate')} — ${language === 'en' ? 'English' : 'हिन्दी'}. ${language === 'en' ? 'हिन्दी' : 'English'}`}
            title={t('common.translate')}
          >
            <Languages size={20} aria-hidden="true" />
            <span className="hidden sm:inline">English / हिन्दी</span>
            <span className="sm:hidden">EN / हिंदी</span>
          </button>
          <ChakraToggle />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-primary hidden !px-5 !text-sm xl:inline-flex"
          >
            {t('common.joinFreeSession')}
          </a>
        </div>
      </nav>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex gap-1 overflow-x-auto py-1" role="navigation" aria-label={t('common.currentSection')}>
            {siteSections.map((section) => {
              const isActive = activeSection === section.id
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
          </div>
          <p
            className="flex min-h-[28px] items-center gap-2 pb-1 text-sm font-semibold"
            style={{ color: 'var(--accent-strong)' }}
            aria-live="polite"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-strong)' }} aria-hidden="true" />
            {pathname === '/' ? t('common.currentSection') : t('common.currentSection')}: {activeLabel}
          </p>
        </div>
      </div>
    </header>
  )
}
