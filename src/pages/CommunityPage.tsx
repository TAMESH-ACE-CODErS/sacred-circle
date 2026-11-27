import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MessageCircle, Youtube } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { SectionHeading } from '../components/SectionHeading'
import { useSiteContent } from '../hooks/useSiteContent'
import { mediaManifest } from '../config/mediaManifest'

export function CommunityPage() {
  const { contact, sundayTime } = useSiteContent()

  const channels = [
    {
      icon: MessageCircle,
      title: 'WhatsApp community',
      text: 'The weekly joining link, session reminders and quiet questions. This is the easiest place to begin.',
      label: 'Join the group',
      href: contact.whatsapp,
    },
    {
      icon: Youtube,
      title: 'YouTube channel',
      text: 'Talks, public recordings and a sense of the teaching before you join a live session.',
      label: 'Visit the channel',
      href: contact.youtube,
    },
    {
      icon: Mail,
      title: 'Write to us',
      text: 'For a personal question or a simple greeting, an email reaches the team directly.',
      label: `Email ${contact.email}`,
      href: `mailto:${contact.email}`,
    },
  ]

  return (
    <>
      <PageHero
        eyebrow="Community"
        title="A circle is more than a meeting"
        description={`People come from different cities, languages and walks of life. What holds us together is a simple wish to sit quietly and meet one another with kindness. We gather ${sundayTime.toLowerCase()}.`}
        image={mediaManifest.remote.awareness}
        imageAlt="A peaceful outdoor meditation setting"
      >
        <Link to="/sunday-meditation" className="btn-primary">Join Sunday meditation</Link>
      </PageHero>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Stay connected"
          title="Choose the way that suits you"
          description="No algorithm decides what you see here. These are the three ways the circle keeps in touch."
          centered
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {channels.map(({ icon: Icon, title, text, label, href }) => (
            <article key={title} className="card flex flex-col">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl">{title}</h3>
              <p className="mt-3 flex-1 text-base" style={{ color: 'var(--muted)' }}>{text}</p>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="btn-secondary mt-6 w-full !text-sm">
                {label} <ArrowRight size={17} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell !pt-4">
        <div className="soft-panel grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow">From the channel</p>
            <h2 className="!text-3xl">A first look at the teaching</h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>
              If you would like to sit with Diwakar and Lina before the live gathering, this short
              introduction is a gentle place to start.
            </p>
            <a href={contact.youtube} target="_blank" rel="noreferrer" className="btn-primary mt-7">
              <Youtube size={18} /> Open YouTube channel
            </a>
          </div>
          <div className="card overflow-hidden !p-2">
            <iframe
              src="https://www.youtube.com/embed/fbtixdu4RUY"
              title="Introduction to Sacred Circle"
              className="aspect-video w-full rounded-2xl border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  )
}
