import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HeroReel } from '../components/HeroReel'
import { SundaySection } from '../components/SundaySection'
import { AboutSection } from '../components/AboutSection'
import { MaterialsGallery } from '../components/MaterialsGallery'
import { ReviewsSection } from '../components/ReviewsSection'
import { YouTubeSessions } from '../components/YouTubeSessions'
import { FaqSection } from '../components/FaqSection'
import { SectionHeading } from '../components/SectionHeading'
import { WHATSAPP_URL } from '../config/site'

const paths = [
  {
    title: 'Healing',
    text: 'Gentle techniques that settle the nervous system and support the body’s own balance.',
    image: 'https://images.unsplash.com/photo-1505455184862-554165e5f6ba?auto=format&fit=crop&w=1000',
    alt: 'A calm person resting in soft natural light during a healing practice',
  },
  {
    title: 'Manifestation',
    text: 'Simple practices to meet your own life with clarity, gratitude and steady attention.',
    image: 'https://images.unsplash.com/photo-1534630103086-5b1c106f74e0?auto=format&fit=crop&w=1000',
    alt: 'An open journal and a quiet moment of reflection',
  },
  {
    title: 'Awareness',
    text: 'Guided meditation that helps you notice thoughts and feelings without being ruled by them.',
    image: 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=1000',
    alt: 'A person sitting peacefully in meditation outdoors',
  },
]

export function HomePage() {
  return (
    <>
      <HeroReel />
      <SundaySection />

      <section className="section-shell !pt-8">
        <SectionHeading
          eyebrow="What we practise"
          title="Three gentle paths, one steady circle"
          description="Nothing here is elaborate. Each practice is something you can return to in ordinary life — at home, at work, or on a difficult day."
          centered
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {paths.map((path) => (
            <article key={path.title} className="card overflow-hidden !p-0">
              <img src={path.image} alt={path.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-7">
                <h3 className="font-display text-2xl">{path.title}</h3>
                <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>{path.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AboutSection />

      <section id="materials" className="section-shell !pt-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Practice at home"
            title="A small library, always free"
            description="A few recordings and talks to begin with. Take what helps and leave what does not."
          />
          <Link to="/materials" className="btn-secondary shrink-0">
            View all materials <ArrowRight size={18} />
          </Link>
        </div>
        <MaterialsGallery limit={3} showFilters={false} />
      </section>

      <YouTubeSessions />

      <ReviewsSection limit={4} />

      <FaqSection />

      <section className="section-shell !pt-4">
        <div className="soft-panel flex flex-col items-start gap-6 text-center sm:items-center">
          <div className="flex-1">
            <p className="eyebrow">Come as you are</p>
            <h2 className="!text-3xl">A quiet place to return to, every Sunday</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>
              No registration, no fee, no need to know anything beforehand. Bring your questions and
              an open mind.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/sunday-meditation" className="btn-primary">See how the session works</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-secondary">
              Join the WhatsApp group
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
