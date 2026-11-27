import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { KeyRound, LockKeyhole, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Material } from '../types'

export type UnlockedMaterial = {
  media_url: string
  media_type: string
  title: string
}

type Props = {
  material: Material
  open: boolean
  onClose: () => void
  onUnlocked: (material: Material, unlocked: UnlockedMaterial) => void
}

export function PinGate({ material, open, onClose, onUnlocked }: Props) {
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setPin('')
    setError('')
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  async function verify(event: FormEvent) {
    event.preventDefault()
    if (!pin.trim() || busy) return
    setBusy(true)
    setError('')

    try {
      if (supabase) {
        const { data, error: rpcError } = await supabase.rpc('verify_material_pin', {
          material_id: material.id,
          input_pin: pin.trim(),
        })

        if (rpcError) throw rpcError
        const row = (data as UnlockedMaterial[] | null)?.[0]
        if (!row?.media_url) {
          setError('That PIN did not match. Please try again.')
          return
        }
        onUnlocked(material, row)
      } else if (
        material.id === 'sunday-recording-demo' &&
        pin.trim() === (import.meta.env.VITE_DEMO_PIN ?? '2468')
      ) {
        onUnlocked(material, {
          media_url: '/audio/aum-soft.wav',
          media_type: 'audio',
          title: material.title,
        })
      } else {
        setError('That PIN did not match. Please try again.')
      }
    } catch {
      setError('We could not check the PIN just now. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: 'rgba(12, 10, 18, 0.62)' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-title"
            className="card relative w-full max-w-md !p-8"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full"
              style={{ color: 'var(--muted)' }}
              aria-label="Close PIN dialog"
            >
              <X size={20} />
            </button>

            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
            >
              <LockKeyhole size={22} />
            </span>
            <h2 id="pin-title" className="mt-5 text-2xl">Enter the PIN</h2>
            <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>
              {material.title} is shared privately with participants. The PIN is checked securely;
              it is never stored in your browser.
            </p>

            <form onSubmit={verify} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">PIN code</span>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted)' }}
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    className="field !pl-11"
                    placeholder="Enter PIN"
                    aria-describedby={error ? 'pin-error' : undefined}
                  />
                </div>
              </label>

              {error && (
                <p id="pin-error" role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
                  {error}
                </p>
              )}
              {!import.meta.env.VITE_SUPABASE_URL && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Demo mode: the sample recording uses the PIN from <code>VITE_DEMO_PIN</code>.
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? 'Checking…' : 'Open recording'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
