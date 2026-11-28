import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HeroReel } from '../components/HeroReel'
import { SundaySection } from '../components/SundaySection'
import { AboutSection } from '../components/AboutSection'
import { MaterialsGallery } from '../components/MaterialsGallery'
import { AudioLibrary } from '../components/AudioLibrary'
import { ReviewsSection } from '../components/ReviewsSection'
import { YouTubeSessions } from '../components/YouTubeSessions'
import { AnnouncementsSection } from '../components/AnnouncementsSection'
import { EventsSection } from '../components/EventsSection'
import { CommunitySection } from '../components/CommunitySection'
import { FaqSection } from '../components/FaqSection'
import { SectionHeading } from '../components/SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { trackVisitorEvent } from '../lib/sheetTracker'
import { WHATSAPP_URL } from '../config/site'
import type { TranslationKey } from '../i18n/translations'

const paths: { title: TranslationKey; text: TranslationKey; image: string; alt: TranslationKey }[] = [
  {
    title: 'paths.healingTitle',
    text: 'paths.healingText',
    image: 'https://images.unsplash.com/photo-1505455184862-554165e5f6ba?auto=format&fit=crop&w=1000',
    alt: 'paths.healingAlt',
  },
  {
    title: 'paths.manifestationTitle',
    text: 'paths.manifestationText',
    image: 'https://images.unsplash.com/photo-1534630103086-5b1c106f74e0?auto=format&fit=crop&w=1000',
    alt: 'paths.manifestationAlt',
  },
  {
    title: 'paths.awarenessTitle',
    text: 'paths.awarenessText',
    image: 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=1000',
    alt: 'paths.awarenessAlt',
  },
]

export function HomePage() {
  const { t } = useLanguage()

  return (
    <>
      <HeroReel />
      <AnnouncementsSection />
      <SundaySection />
      <EventsSection />

      <section className="section-shell !pt-12">
        <SectionHeading
          eyebrow={t('paths.eyebrow')}
          title={t('paths.title')}
          description={t('paths.description')}
          centered
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {paths.map((path) => (
            <article key={path.title} className="card overflow-hidden !p-0">
              <img src={path.image} alt={t(path.alt)} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-7">
                <h3 className="font-display text-2xl">{t(path.title)}</h3>
                <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>{t(path.text)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AboutSection />

      <YouTubeSessions />

      <CommunitySection />

      <section id="materials" className="section-shell !pt-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={t('materialsHome.eyebrow')}
            title={t('materialsHome.title')}
            description={t('materialsHome.description')}
          />
          <Link to="/materials" className="btn-secondary shrink-0">
            {t('materialsHome.viewAll')} <ArrowRight size={18} />
          </Link>
        </div>
        <MaterialsGallery limit={3} showFilters={false} />
      </section>

      <AudioLibrary />

      <ReviewsSection limit={4} />

      <FaqSection />

      <section className="section-shell !pt-12">
        <div className="soft-panel flex flex-col items-start gap-6 text-center sm:items-center">
          <div className="flex-1">
            <p className="eyebrow">{t('cta.eyebrow')}</p>
            <h2 className="!text-3xl">{t('cta.title')}</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>
              {t('cta.description')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/sunday-meditation" className="btn-primary">{t('cta.seeHow')}</Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              onClick={() => trackVisitorEvent('whatsapp_click', { eventDetail: 'Home closing CTA' })}
            >
              {t('cta.joinWhatsApp')}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
