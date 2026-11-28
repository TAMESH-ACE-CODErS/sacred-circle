import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, MessageCircle } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { SundaySection } from '../components/SundaySection'
import { SectionHeading } from '../components/SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { useSiteContent } from '../hooks/useSiteContent'
import { WHATSAPP_URL, YOUTUBE_URL } from '../config/site'
import { mediaManifest } from '../config/mediaManifest'
import type { TranslationKey } from '../i18n/translations'

const steps: { number: string; title: TranslationKey; text: TranslationKey }[] = [
  { number: '01', title: 'sundayPage.s1Title', text: 'sundayPage.s1Text' },
  { number: '02', title: 'sundayPage.s2Title', text: 'sundayPage.s2Text' },
  { number: '03', title: 'sundayPage.s3Title', text: 'sundayPage.s3Text' },
  { number: '04', title: 'sundayPage.s4Title', text: 'sundayPage.s4Text' },
]

const pageFaqs: { question: TranslationKey; answer: TranslationKey }[] = [
  { question: 'sundayPage.q1', answer: 'sundayPage.a1' },
  { question: 'sundayPage.q2', answer: 'sundayPage.a2' },
  { question: 'sundayPage.q3', answer: 'sundayPage.a3' },
  { question: 'sundayPage.q4', answer: 'sundayPage.a4' },
]

export function SundayMeditationPage() {
  const { sundayTime } = useSiteContent()
  const { t, language } = useLanguage()

  return (
    <>
      <PageHero
        eyebrow={t('sundayPage.heroEyebrow')}
        title={t('sundayPage.heroTitle')}
        description={`${language === 'hi' ? t('sunday.time') : sundayTime}. ${t('sundayPage.heroDescription')}`}
        image={mediaManifest.remote.sunday}
        imageAlt="A quiet meditation space in soft daylight"
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
          <MessageCircle size={18} /> {t('sundayPage.getLink')}
        </a>
        <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" className="btn-secondary">
          {t('sundayPage.watch')}
        </a>
      </PageHero>

      <SundaySection />

      <section className="section-shell !pt-12">
        <SectionHeading
          eyebrow={t('sundayPage.expectEyebrow')}
          title={t('sundayPage.expectTitle')}
          description={t('sundayPage.expectDescription')}
          centered
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="card">
              <p className="font-display text-3xl" style={{ color: 'var(--accent)' }}>{step.number}</p>
              <h3 className="mt-4 font-display text-xl">{t(step.title)}</h3>
              <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>{t(step.text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow={t('faq.eyebrow')}
            title={t('sundayPage.faqTitle')}
            description={t('sundayPage.faqDescription')}
          />
          <div className="space-y-4">
            {pageFaqs.map((item) => (
              <details key={item.question} className="card !p-6" open={item.question === 'sundayPage.q1'}>
                <summary className="cursor-pointer font-medium">{t(item.question)}</summary>
                <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>{t(item.answer)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="soft-panel flex flex-col gap-6 text-center">
          <CalendarDays size={28} className="mx-auto" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <h2 className="!text-3xl">{t('sundayPage.closingTitle')}</h2>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--muted)' }}>
            {t('sundayPage.closingDescription')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
              {t('cta.joinWhatsApp')}
            </a>
            <Link to="/materials" className="btn-secondary">
              {t('sundayPage.exploreLibrary')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
