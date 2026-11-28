import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { getFounderImage } from '../config/mediaManifest'
import { useLanguage } from '../context/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const milestones: { question: TranslationKey; answer: TranslationKey }[] = [
  { question: 'about.q1', answer: 'about.a1' },
  { question: 'about.q2', answer: 'about.a2' },
  { question: 'about.q3', answer: 'about.a3' },
  { question: 'about.q4', answer: 'about.a4' },
]

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <section id="about" className="section-shell">
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <SectionHeading
            eyebrow={t('about.eyebrow')}
            title={t('about.title')}
            description={t('about.description')}
          />
          <div className="mt-8 space-y-5 text-lg" style={{ color: 'var(--muted)' }}>
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/sunday-meditation" className="btn-primary">{t('about.cta1')}</Link>
            <Link to="/reviews" className="btn-secondary">{t('about.cta2')}</Link>
          </div>
        </div>

        <figure className="order-1 mx-auto w-full max-w-md lg:order-2">
          <div
            className="rounded-[2.25rem] border-2 p-2.5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <img
              src={getFounderImage('clientMF')}
              alt={`${t('about.caption')}, founders of Sacred Circle, seated together`}
              className="block aspect-[4/5] w-full rounded-[1.75rem] object-cover object-top"
              loading="lazy"
            />
          </div>
          <figcaption className="soft-panel mt-5 text-center">
            <p className="font-display text-lg">{t('about.caption')}</p>
            <p className="mt-1 text-base" style={{ color: 'var(--muted)' }}>
              {t('about.stats')}
            </p>
          </figcaption>
        </figure>
      </div>

      <div className="mt-12">
        <p className="eyebrow">{t('about.milestoneEyebrow')}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {milestones.map((item, index) => (
            <details key={item.question} className="card group !p-0" open={index === 0}>
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-lg font-semibold sm:text-xl">
                <span>{t(item.question)}</span>
                <ChevronDown
                  size={24}
                  className="shrink-0 transition-transform group-open:rotate-180"
                  style={{ color: 'var(--accent-strong)' }}
                  aria-hidden="true"
                />
              </summary>
              <div
                className="border-t px-6 py-5 text-base leading-relaxed sm:text-lg"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                {t(item.answer)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
