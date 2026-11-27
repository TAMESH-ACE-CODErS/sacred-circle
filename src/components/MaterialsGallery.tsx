import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LockKeyhole, Search, UnlockKeyhole } from 'lucide-react'
import { useSiteContent } from '../hooks/useSiteContent'
import { MediaPlayer } from './MediaPlayer'
import { MediaIcon } from './MediaIcon'
import { PinGate, type UnlockedMaterial } from './PinGate'
import type { Material } from '../types'

type Props = {
  limit?: number
  showFilters?: boolean
}

export function MaterialsGallery({ limit, showFilters = true }: Props) {
  const { materials } = useSiteContent()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [gateMaterial, setGateMaterial] = useState<Material | null>(null)
  const [unlocked, setUnlocked] = useState<Record<string, UnlockedMaterial>>({})

  const base = typeof limit === 'number' ? materials.slice(0, limit) : materials
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(base.map((item) => item.category)))],
    [base],
  )

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return base.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesQuery =
        !needle ||
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [base, category, query])

  return (
    <>
      {showFilters && (
        <div className="mt-10 flex flex-col gap-4">
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the library"
              className="field !pl-11"
              aria-label="Search materials"
            />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className="min-h-[48px] rounded-full border px-5 text-sm font-medium transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  background: item === category ? 'var(--text)' : 'transparent',
                  color: item === category ? 'var(--bg)' : 'var(--muted)',
                }}
                aria-pressed={item === category}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((item) => {
            const open = unlocked[item.id]
            const isYouTube =
              item.media_url?.includes('youtube.com') || item.media_url?.includes('youtu.be')
            const canPlayInline = Boolean(open?.media_url || (!item.is_locked && item.media_url))

            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="card flex flex-col overflow-hidden !p-0"
              >
                <div className="relative">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="soft-panel aspect-video !rounded-none" />
                  )}
                  <span
                    className="absolute left-4 top-4 inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 text-xs font-semibold"
                    style={{ background: 'var(--surface)', color: 'var(--text)' }}
                  >
                    <MediaIcon mediaType={open?.media_type ?? item.media_type} />
                    {item.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl">{open?.title ?? item.title}</h3>
                  <p className="mt-3 flex-1 text-base" style={{ color: 'var(--muted)' }}>
                    {item.description}
                  </p>

                  {canPlayInline ? (
                    <div className="mt-5">
                      <MediaPlayer
                        url={(open?.media_url ?? item.media_url) as string}
                        mediaType={open?.media_type ?? item.media_type}
                        title={open?.title ?? item.title}
                      />
                      {isYouTube && !open && (
                        <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                          If the video does not load here, open it on YouTube.
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setGateMaterial(item)}
                      className="btn-secondary mt-6 w-full"
                    >
                      <LockKeyhole size={18} />
                      Enter PIN to open
                    </button>
                  )}
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </div>

      {!shown.length && (
        <p className="mt-12 text-center text-lg" style={{ color: 'var(--muted)' }}>
          No materials match that search. Try a different word or category.
        </p>
      )}

      {gateMaterial && (
        <PinGate
          material={gateMaterial}
          open
          onClose={() => setGateMaterial(null)}
          onUnlocked={(material, data) => {
            setUnlocked((current) => ({ ...current, [material.id]: data }))
            setGateMaterial(null)
          }}
        />
      )}

      <p className="mt-10 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
        <UnlockKeyhole size={16} />
        Every material is offered freely. If a PIN is needed, it is shared in the Sunday session.
      </p>
    </>
  )
}
