import { faqs } from '../config/faq'
import { useLanguage } from '../context/LanguageContext'
import { SectionHeading } from './SectionHeading'

export function FaqSection() {
  const { t } = useLanguage()

  return (
    <section id="faq" className="section-shell !pt-8">
      <SectionHeading
        eyebrow={t('faq.eyebrow')}
        title={t('faq.title')}
        description={t('faq.description')}
        centered
      />

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        {faqs.map((faq) => (
          <details key={faq.questionKey} className="card group !p-0">
            <summary className="flex min-h-[64px] cursor-pointer items-center justify-between gap-4 px-6 py-5 text-lg font-semibold sm:text-xl">
              {t(faq.questionKey)}
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform group-open:rotate-45"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="border-t px-6 py-5 text-lg leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              {t(faq.answerKey)}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
