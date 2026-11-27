import { faqs } from '../config/faq'
import { SectionHeading } from './SectionHeading'

export function FaqSection() {
  return (
    <section id="faq" className="section-shell !pt-8">
      <SectionHeading
        eyebrow="Common questions"
        title="Frequently Asked Questions"
        description="A few clear answers before you arrive. If your question is not here, please write to us — we are happy to help."
        centered
      />

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="card group !p-0">
            <summary className="flex min-h-[64px] cursor-pointer items-center justify-between gap-4 px-6 py-5 text-lg font-semibold sm:text-xl">
              {faq.question}
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform group-open:rotate-45"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="border-t px-6 py-5 text-lg leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
