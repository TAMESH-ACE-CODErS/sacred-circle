import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const SIZES = [18, 20, 22] as const
const STORAGE_KEY = 'sacred-circle-font-size'

type FontSizeValue = {
  decrease: () => void
  increase: () => void
  canDecrease: boolean
  canIncrease: boolean
  sizeLabel: string
}

const FontSizeContext = createContext<FontSizeValue | null>(null)

function initialIndex(): number {
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(saved) && saved >= 0 && saved < SIZES.length) return saved
  } catch {
    // Storage may be unavailable; the default remains comfortable.
  }
  return 0
}

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    document.documentElement.style.fontSize = `${SIZES[index]}px`
    try {
      window.localStorage.setItem(STORAGE_KEY, String(index))
    } catch {
      // The setting still works for this page load.
    }
  }, [index])

  const decrease = useCallback(() => setIndex((current) => Math.max(0, current - 1)), [])
  const increase = useCallback(
    () => setIndex((current) => Math.min(SIZES.length - 1, current + 1)),
    [],
  )

  const value = useMemo<FontSizeValue>(
    () => ({
      decrease,
      increase,
      canDecrease: index > 0,
      canIncrease: index < SIZES.length - 1,
      sizeLabel: `${SIZES[index]}px`,
    }),
    [decrease, increase, index],
  )

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>
}

export function useFontSize(): FontSizeValue {
  const context = useContext(FontSizeContext)
  if (!context) throw new Error('useFontSize must be used inside FontSizeProvider')
  return context
}
