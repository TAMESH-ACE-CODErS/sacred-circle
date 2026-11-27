import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const MULADHARA_RED = '#C62828'
const MULADHARA_DEEP = '#B71C1C'
const SAHASRARA_PURPLE = '#7E22CE'
const SAHASRARA_LIGHT = '#9333EA'

function ChakraGlyph({ isDark }: { isDark: boolean }) {
  const color = isDark ? SAHASRARA_PURPLE : MULADHARA_RED
  const inner = isDark ? SAHASRARA_LIGHT : MULADHARA_DEEP
  const petals = isDark ? 12 : 4

  return (
    <>
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="21.5" stroke={color} strokeWidth="1.2" opacity="0.8" />
        <circle cx="24" cy="24" r="18.5" stroke={inner} strokeWidth="0.8" opacity="0.45" />
        {Array.from({ length: petals }).map((_, i) => (
          <path
            key={i}
            d={
              isDark
                ? 'M24 22.5C20.6 16.4 20.8 9.3 24 4.2c3.2 5.1 3.4 12.2 0 18.3Z'
                : 'M24 22.8C17.6 18.6 16.3 11.4 24 4.5c7.7 6.9 6.4 14.1 0 18.3Z'
            }
            stroke={i % 2 === 0 ? color : inner}
            strokeWidth={isDark ? 0.95 : 1.35}
            opacity={isDark ? 0.9 : 1}
            transform={`rotate(${(360 / petals) * i} 24 24)`}
          />
        ))}
        {isDark ? (
          <circle cx="24" cy="24" r="8" stroke={inner} strokeWidth="1.2" />
        ) : (
          <rect
            x="18"
            y="18"
            width="12"
            height="12"
            stroke={inner}
            strokeWidth="1.2"
            transform="rotate(45 24 24)"
          />
        )}
      </svg>
      <span
        className="devanagari relative z-10 grid h-full w-full place-items-center text-[15px] font-bold leading-none"
        style={{ color: inner }}
        aria-hidden="true"
      >
        {isDark ? 'ॐ' : 'लं'}
      </span>
    </>
  )
}

export function ChakraToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-[52px] items-center gap-2 rounded-full border px-3 py-1.5 text-base font-medium transition-colors duration-500"
      style={{
        color: 'var(--text)',
        borderColor: 'var(--border)',
        background: 'var(--surface)',
      }}
      aria-label={
        isDark
          ? 'Switch to light theme — Muladhara chakra, बीज मंत्र लं'
          : 'Switch to dark theme — Sahasrara chakra, बीज मंत्र ॐ'
      }
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="relative grid h-10 w-10 shrink-0 place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            className="absolute inset-0"
            initial={{ opacity: 0, rotate: isDark ? -100 : 100, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: isDark ? 100 : -100, scale: 0.7 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChakraGlyph isDark={isDark} />
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
