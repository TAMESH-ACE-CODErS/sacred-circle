import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Youtube } from 'lucide-react'
import { useSiteContent } from '../hooks/useSiteContent'
import { useLanguage } from '../context/LanguageContext'
import { defaultNavItems, routeSectionMap, siteSections } from '../config/navigation'
import { replayIntro } from '../lib/intro'

export function Footer() {
  const { contact, sundayTime, navItems } = useSiteContent()
  const { t, language } = useLanguage()

  function navLabel(label: string, href: string): string {
    if (language !== 'hi' || !defaultNavItems.some((item) => item.href === href)) return label
    const sectionId = routeSectionMap[href]
    const key = siteSections.find((section) => section.id === sectionId)?.labelKey
    return key ? t(key) : label
  }

  return (
    <footer id="contact" className="mt-12 border-t sm:mt-20" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:gap-10 sm:px-8 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-11 w-11" />
            <span className="font-display text-2xl">{t('common.brand')}</span>
          </div>
          <p className="mt-4 max-w-sm" style={{ color: 'var(--muted)' }}>
            {t('footer.description')}
          </p>
          <p className="mt-4 text-base" style={{ color: 'var(--accent)' }}>
            {language === 'hi' ? t('sunday.time') : sundayTime}
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl">{t('footer.explore')}</h3>
          <ul className="mt-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="inline-flex min-h-[44px] items-center hover:opacity-70">
                  {navLabel(item.label, item.href)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl">{t('footer.connected')}</h3>
          <div className="mt-4 space-y-3">
            <a href={contact.youtube} target="_blank" rel="noreferrer" className="btn-link w-full !justify-start">
              <Youtube size={20} /> {t('footer.youtube')}
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="btn-link w-full !justify-start">
              <MessageCircle size={20} /> {t('footer.whatsapp')}
            </a>
            <a href={`mailto:${contact.email}`} className="btn-link w-full !justify-start">
              <Mail size={20} /> {contact.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t px-5 pb-28 pt-6 text-center text-base sm:pb-24" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        <p>© {new Date().getFullYear()} Sacred Circle. {t('footer.copyright')}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <button type="button" onClick={replayIntro} className="btn-link !min-h-[48px] !text-base">
            {t('footer.replayIntro')}
          </button>
          <Link to="/admin" className="btn-link !min-h-[48px] !text-base">{t('footer.admin')}</Link>
        </div>
      </div>
    </footer>
  )
}
