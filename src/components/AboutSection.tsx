import { Link } from 'react-router-dom'
import { SectionHeading } from './SectionHeading'
import { getFounderImage } from '../config/mediaManifest'

export function AboutSection() {
  return (
    <section id="about" className="section-shell">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <SectionHeading
            eyebrow="Your guides"
            title="Two lives of practice, shared gently"
            description="Diwakar Raipur and Lina Bhave have spent nearly three decades studying healing and meditation — and keeping the teaching simple enough for anyone to use at home."
          />
          <div className="mt-8 space-y-5 text-lg" style={{ color: 'var(--muted)' }}>
            <p>
              Diwakar holds an M.Tech. from IIT Madras, Chennai. Lina holds an M.Sc. from the
              Institute of Science, Nagpur. Both have learned from many facilitators and gurus in
              India and abroad, and have practised more than a hundred modalities.
            </p>
            <p>
              Their own awakening, by the grace of their spiritual master, shapes a way of teaching
              that is grounded, unhurried and free of ceremony for its own sake. What they offer is
              practical: small techniques that settle the mind, ease the body and open a little
              more compassion in daily life.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/sunday-meditation" className="btn-primary">Experience a Sunday session</Link>
            <Link to="/reviews" className="btn-secondary">Read experiences</Link>
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
              alt="Diwakar Raipur and Lina Bhave, founders of Sacred Circle, seated together"
              className="block aspect-[4/5] w-full rounded-[1.75rem] object-cover object-top"
              loading="lazy"
            />
          </div>
          <figcaption className="soft-panel mt-5 text-center">
            <p className="font-display text-lg">Diwakar Raipur &amp; Lina Bhave</p>
            <p className="mt-1 text-base" style={{ color: 'var(--muted)' }}>
              28 years of practice · 100+ modalities · always free
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
