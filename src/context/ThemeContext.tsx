import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { playAum } from '../lib/audio'

type Theme = 'light' | 'dark'

type ThemeValue = {
  theme: Theme
  muted: boolean
  toggleTheme: () => void
  toggleMuted: () => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

function initialTheme(): Theme {
  const saved = localStorage.getItem('sacred-circle-theme')
  return saved === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [muted, setMuted] = useState(() => localStorage.getItem('sacred-circle-muted') === 'yes')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('sacred-circle-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('sacred-circle-muted', muted ? 'yes' : 'no')
  }, [muted])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      playAum(muted)
      return next
    })
  }, [muted])

  const toggleMuted = useCallback(() => setMuted((m) => !m), [])

  const value = useMemo(
    () => ({ theme, muted, toggleTheme, toggleMuted }),
    [theme, muted, toggleTheme, toggleMuted],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
