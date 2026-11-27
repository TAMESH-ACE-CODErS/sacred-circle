import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSiteContent } from '../hooks/useSiteContent'
import { WHATSAPP_URL } from '../config/site'
import { ChakraToggle, SoundToggle } from './ChakraToggle'

export function Navbar() {
  const { navItems } = useSiteContent()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', borderColor: 'var(--border)' }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8" aria-label="Main navigation">
        <Link to="/" className="flex min-h-[52px] items-center gap-3" aria-label="Sacred Circle home">
          <img src="/favicon.svg" alt="" className="h-10 w-10 shrink-0" />
          <span className="font-display text-xl tracking-tight sm:text-2xl">Sacred Circle</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="inline-flex min-h-[52px] items-center rounded-full px-4 text-base transition-colors hover:opacity-70"
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent-strong)' : 'var(--text)',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><SoundToggle /></div>
          <ChakraToggle />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-primary hidden !px-5 !text-sm xl:inline-flex"
          >
            Join Free Session
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-[52px] min-w-[52px] items-center justify-center gap-2 rounded-full border px-3 text-sm lg:hidden"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
            <span>{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden lg:hidden"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[56px] items-center rounded-xl px-4 text-lg"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--accent-strong)' : 'var(--text)',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex items-center justify-between gap-2">
                <SoundToggle />
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary !text-sm">
                  Join Free Session
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
