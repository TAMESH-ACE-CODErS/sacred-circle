import { useEffect, useRef, useState, type FormEvent } from 'react'
import { KeyRound, LockKeyhole } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { supabase } from '../lib/supabase'
import { verifyAudioPin } from '../lib/sheetApi'
import { useLanguage } from '../context/LanguageContext'
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
  const { t } = useLanguage()

  useEffect(() => {
    if (!open) return
    setPin('')
    setError('')
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [open])

  async function verify(event: FormEvent) {
    event.preventDefault()
    const value = pin.trim()
    if (!value || busy) return
    setBusy(true)
    setError('')

    try {
      if (supabase) {
        const { data, error: rpcError } = await supabase.rpc('verify_material_pin', {
          material_id: material.id,
          input_pin: value,
        })
        if (rpcError) throw rpcError
        const row = (data as UnlockedMaterial[] | null)?.[0]
        if (!row?.media_url) {
          setError(t('pin.wrong'))
          return
        }
        onUnlocked(material, row)
        return
      }

      if (material.id === 'sunday-recording-demo' && value === (import.meta.env.VITE_DEMO_PIN ?? '2468')) {
        onUnlocked(material, {
          media_url: '/audio/aum-soft.wav',
          media_type: 'audio',
          title: material.title,
        })
        return
      }

      const result = await verifyAudioPin(material.id, value)
      if (!result.ok || !result.audio_preview_url) {
        setError(t('pin.wrong'))
        return
      }
      onUnlocked(material, {
        media_url: result.audio_preview_url,
        media_type: 'audio',
        title: result.title || material.title,
      })
    } catch {
      setError(t('pin.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t('pin.title')} titleId="pin-title">
      <p className="text-lg" style={{ color: 'var(--muted)' }}>
        {t('pin.body').replace('{title}', material.title)}
      </p>
      <form onSubmit={(event) => void verify(event)} className="mt-6 space-y-5">
        <label htmlFor="material-pin" className="block text-base font-semibold">{t('pin.label')}</label>
        <div className="relative">
          <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} aria-hidden="true" />
          <input
            id="material-pin"
            ref={inputRef}
            className="field !h-14 !pl-12 !text-2xl"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={20}
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'pin-error' : undefined}
          />
        </div>
        {error && <p id="pin-error" role="alert" className="text-base font-semibold text-red-800 dark:text-red-300">{error}</p>}
        <button type="submit" className="btn-primary w-full !min-h-[56px]" disabled={busy || !pin.trim()}>
          <LockKeyhole size={19} aria-hidden="true" />
          {busy ? t('audio.checking') : t('pin.unlock')}
        </button>
      </form>
    </BottomSheet>
  )
}
