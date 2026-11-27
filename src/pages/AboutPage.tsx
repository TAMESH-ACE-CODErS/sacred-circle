import { Link } from 'react-router-dom'
import { Compass, HandHeart, Leaf, Sparkles } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { AboutSection } from '../components/AboutSection'
import { SectionHeading } from '../components/SectionHeading'
import { getFounderImage } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const principles: { icon: typeof Leaf; title: TranslationKey; text: TranslationKey }[] = [
  { icon: Leaf, title: 'aboutPage.p1Title', text: 'aboutPage.p1Text' },
  { icon: HandHeart, title: 'aboutPage.p2Title', text: 'aboutPage.p2Text' },
  { icon: Compass, title: 'aboutPage.p3Title', text: 'aboutPage.p3Text' },
  { icon: Sparkles, title: 'aboutPage.p4Title', text: 'aboutPage.p4Text' },
]

export function AboutPage() {
  const { t, language } = useLanguage()

  return (
    <>
      <PageHero
        eyebrow={t('aboutPage.heroEyebrow')}
        title={t('aboutPage.heroTitle')}
        description={t('aboutPage.heroDescription')}
        image={getFounderImage('clientMF')}
        imageAlt="Diwakar Raipur and Lina Bhave"
      >
        <Link to="/sunday-meditation" className="btn-primary">{t('aboutPage.join')}</Link>
        <Link to="/reviews" className="btn-secondary">{t('about.cta2')}</Link>
      </PageHero>

      <AboutSection />

      <section className="section-shell !pt-4">
        <SectionHeading
          eyebrow={t('aboutPage.principlesEyebrow')}
          title={t('aboutPage.principlesTitle')}
          description={t('aboutPage.principlesDescription')}
          centered
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card flex gap-5">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-xl">{t(title)}</h3>
                <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>{t(text)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="soft-panel grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">{t('aboutPage.storyEyebrow')}</p>
            <p className="font-display text-2xl leading-snug sm:text-3xl">
              {t('aboutPage.storyLine')}
            </p>
          </div>
          <div className="shrink-0">
            <p className="text-lg font-medium">{language === 'hi' ? t('sunday.time') : 'Every Sunday, 4:00 PM IST'}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {t('common.online')} · {t('common.free')} · {t('common.everyoneWelcome')}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
