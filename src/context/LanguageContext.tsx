import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { dictionaries, type TranslationKey } from '../i18n/translations'

export type Language = keyof typeof dictionaries

type LanguageValue = {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)
const STORAGE_KEY = 'sacred-circle-language'

function initialLanguage(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Translation still works for this page load if storage is disabled.
    }
  }, [language])

  const toggleLanguage = useCallback(
    () => setLanguage((current) => (current === 'en' ? 'hi' : 'en')),
    [],
  )

  const value = useMemo<LanguageValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key) => dictionaries[language][key],
    }),
    [language, toggleLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
