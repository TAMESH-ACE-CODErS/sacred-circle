import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, MessageCircle } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { SundaySection } from '../components/SundaySection'
import { SectionHeading } from '../components/SectionHeading'
import { useSiteContent } from '../hooks/useSiteContent'
import { WHATSAPP_URL, YOUTUBE_URL } from '../config/site'
import { mediaManifest } from '../config/mediaManifest'

const steps = [
  {
    number: '01',
    title: 'Arrive as you are',
    text: 'Join online a few minutes early if you can. There is nothing to bring and nothing to prepare.',
  },
  {
    number: '02',
    title: 'A gentle conversation',
    text: 'We speak plainly about health, stress, relationships, work and the inner life. Questions are welcome.',
  },
  {
    number: '03',
    title: 'One guided meditation',
    text: 'You are guided through a technique you can repeat at home. We keep it simple and unhurried.',
  },
  {
    number: '04',
    title: 'Take it with you',
    text: 'The recording is shared so the practice can become part of your week, not just a Sunday hour.',
  },
]

const faqs = [
  {
    question: 'Do I need any experience?',
    answer: 'No. We begin from the beginning, and many people arrive with no meditation background at all.',
  },
  {
    question: 'Is it really free?',
    answer: 'Yes. The sessions and materials are offered as seva. There is no fee, subscription or obligation.',
  },
  {
    question: 'What should I do during the session?',
    answer: 'Sit or lie somewhere comfortable. Keep a glass of water nearby. You may keep your camera off if that helps you settle.',
  },
  {
    question: 'How do I get the joining link?',
    answer: 'Join the WhatsApp group, where the weekly link and any changes to the time are shared first.',
  },
]

export function SundayMeditationPage() {
  const { sundayTime } = useSiteContent()

  return (
    <>
      <PageHero
        eyebrow="Sunday meditation"
        title="A free hour, every week"
        description={`${sundayTime}. We sit together online for about two hours — a calm conversation, one guided meditation, and a practice you can carry into the week.`}
        image={mediaManifest.remote.sunday}
        imageAlt="A quiet meditation space in soft daylight"
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
          <MessageCircle size={18} /> Get the joining link
        </a>
        <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" className="btn-secondary">
          Watch on YouTube
        </a>
      </PageHero>

      <SundaySection />

      <section className="section-shell !pt-4">
        <SectionHeading
          eyebrow="What to expect"
          title="The shape of the session"
          description="There is no performance here. The hour simply moves from settling, to learning, to quiet practice."
          centered
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="card">
              <p className="font-display text-3xl" style={{ color: 'var(--accent)' }}>{step.number}</p>
              <h3 className="mt-4 font-display text-xl">{step.title}</h3>
              <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Common questions"
            title="A little more detail"
            description="If anything is unclear, ask in the WhatsApp group. A real person will answer."
          />
          <div className="space-y-4">
            {faqs.map((item) => (
              <details key={item.question} className="card !p-6" open={item.question === 'Do I need any experience?'}>
                <summary className="cursor-pointer font-medium">{item.question}</summary>
                <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="soft-panel flex flex-col gap-6 text-center">
          <CalendarDays size={28} className="mx-auto" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <h2 className="!text-3xl">We will be there on Sunday</h2>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--muted)' }}>
            Come once, come every week, or come back after a long gap. The circle is always open.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Join the WhatsApp group
            </a>
            <Link to="/materials" className="btn-secondary">
              Explore the library <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
