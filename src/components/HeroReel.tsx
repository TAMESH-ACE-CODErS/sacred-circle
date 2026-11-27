import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { copy, WHATSAPP_URL } from '../config/site'
import { getFounderImage, mediaManifest } from '../config/mediaManifest'
import { useSiteContent } from '../hooks/useSiteContent'

const lines = [
  { name: copy.foundersEn, teaching: copy.teachingEn, label: 'English', hi: false },
  { name: copy.foundersHi, teaching: copy.teachingHi, label: 'हिन्दी', hi: true },
]

export function HeroReel() {
  const [index, setIndex] = useState(0)
  const { sundayTime } = useSiteContent()

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % lines.length), 7000)
    return () => window.clearInterval(id)
  }, [])

  const line = lines[index]

  return (
    <section className="relative overflow-hidden" aria-label="Welcome to Sacred Circle">
      <div
        className="hero-grain absolute inset-0 opacity-70"
        style={{
          backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(--bg) 94%, transparent), color-mix(in srgb, var(--bg) 74%, transparent)), url(${mediaManifest.remote.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      />

      <div className="section-shell relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow">A free circle of healing & meditation</p>

          <div className="min-h-[9.5rem] sm:min-h-[11rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className={line.hi ? 'devanagari !text-[2.3rem] sm:!text-[3.6rem]' : ''}>
                  {line.name}
                </h1>
                <p
                  className={`mt-5 text-xl sm:text-2xl ${line.hi ? 'devanagari' : ''}`}
                  style={{ color: 'var(--muted)' }}
                >
                  {line.teaching}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex gap-2" aria-label="Choose language">
            {lines.map((item, i) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setIndex(i)}
                className="min-h-[48px] rounded-full border px-4 text-sm font-medium transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: i === index ? 'var(--surface)' : 'var(--muted)',
                  background: i === index ? 'var(--text)' : 'transparent',
                }}
                aria-pressed={i === index}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="mt-8 max-w-xl text-lg" style={{ color: 'var(--muted)' }}>
            {sundayTime}. A quiet hour of meditation, simple healing techniques and friendly
            conversation — offered freely, as seva.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/sunday-meditation" className="btn-primary">
              Join Free Sunday Meditation
              <ArrowRight size={19} />
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-secondary">
              <MessageCircle size={19} />
              Join WhatsApp Group
            </a>
          </div>

          <p className="mt-6 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            100% free · No registration · Beginners warmly welcome
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 rounded-[2.5rem] opacity-60" style={{ background: 'var(--surface-2)' }} aria-hidden="true" />
          <img
            src={getFounderImage('clientMF')}
            alt="Diwakar Raipur and Lina Bhave, founders of Sacred Circle"
            className="card relative w-full object-cover object-top !p-0 aspect-[4/5] overflow-hidden rounded-[2.25rem]"
          />
          <div className="card absolute -bottom-6 left-4 right-4 !rounded-2xl !p-4 text-center sm:left-8 sm:right-8">
            <p className="font-display text-lg">Diwakar Raipur & Lina Bhave</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Your guides in healing and meditation</p>
          </div>
        </div>
      </div>
    </section>
  )
}
