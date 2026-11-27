import { Link } from 'react-router-dom'
import { Compass, HandHeart, Leaf, Sparkles } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { AboutSection } from '../components/AboutSection'
import { SectionHeading } from '../components/SectionHeading'
import { getFounderImage } from '../config/mediaManifest'
import { SUNDAY_SESSION_TIME } from '../config/site'

const principles = [
  {
    icon: Leaf,
    title: 'Simple and practical',
    text: 'We teach what can be practised at home, in ordinary clothes, in ordinary time — not performances or rituals for their own sake.',
  },
  {
    icon: HandHeart,
    title: 'Offered freely',
    text: 'Sessions and recordings are shared as seva. No one is asked to pay, promise, or believe anything before arriving.',
  },
  {
    icon: Compass,
    title: 'No distinction',
    text: 'People of every background, age, faith and level of experience are welcome. Curiosity is enough to begin.',
  },
  {
    icon: Sparkles,
    title: 'Steady, not sensational',
    text: 'Change is usually quiet. We notice small shifts in sleep, breath, relationships and how one meets a difficult day.',
  },
]

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Sacred Circle"
        title="A circle built on quiet practice"
        description="For nearly three decades, Diwakar Raipur and Lina Bhave have shared healing and meditation techniques in a way ordinary people can actually use."
        image={getFounderImage('clientMF')}
        imageAlt="Diwakar Raipur and Lina Bhave"
      >
        <Link to="/sunday-meditation" className="btn-primary">Join a free session</Link>
        <Link to="/reviews" className="btn-secondary">Read experiences</Link>
      </PageHero>

      <AboutSection />

      <section className="section-shell !pt-4">
        <SectionHeading
          eyebrow="How we teach"
          title="Grounded, warm and unhurried"
          description="The practices come from many traditions, but the invitation is always the same: try it gently, notice what happens, and keep only what helps."
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
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="soft-panel grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Our story in a sentence</p>
            <p className="font-display text-2xl leading-snug sm:text-3xl">
              Two dedicated teachers, more than a hundred modalities, twenty-eight years of practice
              — and one free gathering every week.
            </p>
          </div>
          <div className="shrink-0">
            <p className="text-lg font-medium">{SUNDAY_SESSION_TIME}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Online · Free · Everyone welcome</p>
          </div>
        </div>
      </section>
    </>
  )
}
