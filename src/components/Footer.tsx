import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Youtube } from 'lucide-react'
import { useSiteContent } from '../hooks/useSiteContent'

export function Footer() {
  const { contact, sundayTime, navItems } = useSiteContent()

  return (
    <footer className="mt-20 border-t" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-11 w-11" />
            <span className="font-display text-2xl">Sacred Circle</span>
          </div>
          <p className="mt-4 max-w-sm" style={{ color: 'var(--muted)' }}>
            Effective techniques for healing, manifestation and spiritual awakening — shared freely,
            with warmth and without distinction.
          </p>
          <p className="mt-4 text-sm" style={{ color: 'var(--accent)' }}>{sundayTime}</p>
        </div>

        <div>
          <h3 className="font-display text-xl">Explore</h3>
          <ul className="mt-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="inline-flex min-h-[44px] items-center hover:opacity-70">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl">Stay connected</h3>
          <div className="mt-4 space-y-3">
            <a href={contact.youtube} target="_blank" rel="noreferrer" className="btn-link w-full !justify-start">
              <Youtube size={20} /> YouTube Channel
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="btn-link w-full !justify-start">
              <MessageCircle size={20} /> WhatsApp Community
            </a>
            <a href={`mailto:${contact.email}`} className="btn-link w-full !justify-start">
              <Mail size={20} /> {contact.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t px-5 py-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        <p>© {new Date().getFullYear()} Sacred Circle. All meditation sessions and materials are free.</p>
        <Link to="/admin" className="btn-link !min-h-0 !text-xs">Admin board</Link>
      </div>
    </footer>
  )
}
