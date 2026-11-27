import { CalendarDays, Clock3, HeartHandshake, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeading } from './SectionHeading'
import { mediaManifest } from '../config/mediaManifest'
import { useSiteContent } from '../hooks/useSiteContent'
import { WHATSAPP_URL } from '../config/site'

const details = [
  {
    icon: CalendarDays,
    title: 'Every Sunday',
    text: 'A steady, familiar gathering — no booking, no fee, no prior experience needed.',
  },
  {
    icon: Clock3,
    title: 'About two hours',
    text: 'Unhurried discussion followed by a guided meditation you can practise again at home.',
  },
  {
    icon: HeartHandshake,
    title: 'Completely free',
    text: 'Offered as seva. We never ask for payment, and newcomers are always welcomed.',
  },
  {
    icon: Video,
    title: 'Recordings shared',
    text: 'Participants receive the meditation recording for their own quiet practice during the week.',
  },
]

export function SundaySection() {
  const { sundayTime } = useSiteContent()

  return (
    <section id="sunday" className="section-shell !py-12 sm:!py-20">
      <div className="overflow-hidden rounded-[2.5rem] border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[280px] lg:min-h-full">
            <img
              src={mediaManifest.remote.sunday}
              alt="A person meditating quietly in natural light"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-8 sm:p-12">
            <SectionHeading
              eyebrow="Our weekly gathering"
              title="The Sunday Meditation"
              description="We sit together, talk plainly about the concerns of ordinary life, and learn one simple, effective technique. Health, stress, relationships, work and spiritual questions are all welcome here."
            />
            <p className="mt-6 font-display text-xl" style={{ color: 'var(--accent-strong)' }}>
              {sundayTime} · Online · Free
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {details.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <Icon size={22} className="mt-1 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-lg">{title}</h3>
                    <p className="text-base" style={{ color: 'var(--muted)' }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary">
                Get the Zoom link on WhatsApp
              </a>
              <Link to="/materials" className="btn-secondary">Browse the library</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
