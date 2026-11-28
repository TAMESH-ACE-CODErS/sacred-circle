import { useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

type Props<T> = {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  getKey: (item: T, index: number) => string
  label: string
}

/** A touch-first, snap-aligned deck with large Previous / Next controls. */
export function SwipeDeck<T>({ items, renderItem, getKey, label }: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const { t } = useLanguage()

  function moveTo(nextIndex: number): void {
    const clamped = Math.max(0, Math.min(items.length - 1, nextIndex))
    const container = containerRef.current
    const slide = container?.children[clamped] as HTMLElement | undefined
    if (container && slide) container.scrollTo({ left: slide.offsetLeft - container.offsetLeft, behavior: 'smooth' })
    setIndex(clamped)
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3"
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        onScroll={(event) => {
          const container = event.currentTarget
          const slideWidth = container.firstElementChild?.clientWidth ?? container.clientWidth
          if (slideWidth > 0) setIndex(Math.round(container.scrollLeft / slideWidth))
        }}
      >
        {items.map((item, itemIndex) => (
          <div key={getKey(item, itemIndex)} className="min-w-full shrink-0 snap-center">
            {renderItem(item, itemIndex)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-5">
          <button
            type="button"
            className="btn-secondary !min-h-[52px] !px-5 !text-base"
            onClick={() => moveTo(index - 1)}
            disabled={index === 0}
          >
            <ChevronLeft size={20} aria-hidden="true" />
            {t('deck.previous')}
          </button>
          <div className="flex items-center gap-2" role="status" aria-label={`${index + 1} / ${items.length}`}>
            {items.map((item, dotIndex) => (
              <button
                key={getKey(item, dotIndex)}
                type="button"
                onClick={() => moveTo(dotIndex)}
                aria-label={`${t('deck.goTo')} ${dotIndex + 1}`}
                aria-current={dotIndex === index ? 'true' : undefined}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
              >
                <span
                  className="h-4 w-4 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: 'var(--accent-strong)',
                    background: dotIndex === index ? 'var(--accent-strong)' : 'transparent',
                  }}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-secondary !min-h-[52px] !px-5 !text-base"
            onClick={() => moveTo(index + 1)}
            disabled={index === items.length - 1}
          >
            {t('deck.next')}
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
