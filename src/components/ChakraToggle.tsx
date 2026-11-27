import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function Muladhara() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="20.5" stroke="currentColor" strokeWidth="1.3" opacity="0.65" />
      {[0, 90, 180, 270].map((angle) => (
        <path
          key={angle}
          d="M24 5c4.4 4.2 5.2 8.3 0 13-5.2-4.7-4.4-8.8 0-13z"
          stroke="currentColor"
          strokeWidth="1.3"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <rect
        x="16.5"
        y="16.5"
        width="15"
        height="15"
        stroke="currentColor"
        strokeWidth="1.3"
        transform="rotate(45 24 24)"
      />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  )
}

function Sahasrara() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={i}
          cx="24"
          cy="10.5"
          rx="3.1"
          ry="6.4"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${i * 30} 24 24)`}
          opacity="0.85"
        />
      ))}
      <circle cx="24" cy="24" r="7.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="2.6" fill="currentColor" />
    </svg>
  )
}

export function ChakraToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-[52px] items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors duration-300"
      style={{
        color: 'var(--text)',
        borderColor: 'var(--border)',
        background: 'var(--surface)',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="relative grid h-8 w-8 place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            className="absolute inset-0 grid place-items-center"
            initial={{ opacity: 0, rotate: isDark ? -90 : 90, scale: 0.75 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: isDark ? 90 : -90, scale: 0.75 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {isDark ? <Sahasrara /> : <Muladhara />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}

export function SoundToggle() {
  const { muted, toggleMuted } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleMuted}
      className="inline-flex min-h-[48px] items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors hover:opacity-75"
      style={{ color: 'var(--muted)' }}
      aria-label={muted ? 'Turn Aum sound on' : 'Turn Aum sound off'}
      title={muted ? 'Turn Aum sound on' : 'Turn Aum sound off'}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      <span>{muted ? 'Sound off' : 'Sound on'}</span>
    </button>
  )
}
