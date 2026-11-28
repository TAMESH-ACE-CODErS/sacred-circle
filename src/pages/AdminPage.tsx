import { useState, type FormEvent } from 'react'
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { SheetAnnouncements, SheetEvents } from '../components/admin/SheetAdmin'

type Tab = 'announcements' | 'events'

export function AdminPage() {
  const { t } = useLanguage()
  const configuredPin = import.meta.env.VITE_ADMIN_PIN ?? ''
  const [pin, setPin] = useState('')
  const [unlockedPin, setUnlockedPin] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('announcements')

  function unlock(event: FormEvent) {
    event.preventDefault()
    const value = pin.trim()
    if (!value) {
      setError(t('admin.pinRequired'))
      return
    }
    if (configuredPin && value !== configuredPin) {
      setError(t('admin.pinWrong'))
      return
    }
    setUnlockedPin(value)
    setPin('')
    setError('')
  }

  return (
    <section className="section-shell !py-12 sm:!py-16">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">{t('admin.privateArea')}</p>
        <h1 className="!text-3xl sm:!text-4xl">{t('footer.admin')}</h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>{t('admin.pinBody')}</p>

        {!unlockedPin ? (
          <div className="card mx-auto mt-10 max-w-xl text-center">
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
            >
              <ShieldCheck size={26} aria-hidden="true" />
            </span>
            <h2 className="mt-5 !text-2xl">{t('admin.pinTitle')}</h2>
            <form onSubmit={unlock} className="mt-7 space-y-5 text-left">
              <div>
                <label htmlFor="admin-pin" className="mb-2 block text-base font-semibold">
                  {t('admin.pinLabel')}
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  className="field"
                  value={pin}
                  autoComplete="off"
                  maxLength={200}
                  onChange={(event) => setPin(event.target.value)}
                />
              </div>
              {!configuredPin && <p className="text-base" style={{ color: 'var(--muted)' }}>{t('admin.pinMissing')}</p>}
              {error && <p className="text-base font-semibold text-red-800 dark:text-red-300" role="alert">{error}</p>}
              <button type="submit" className="btn-primary w-full !min-h-[56px]">
                <LockKeyhole size={19} aria-hidden="true" />
                {t('admin.unlock')}
              </button>
            </form>
            <div className="mt-7"><Link to="/" className="btn-link">{t('admin.backToCircle')}</Link></div>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('admin.privateArea')}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'announcements'}
                  onClick={() => setTab('announcements')}
                  className="min-h-[52px] rounded-full border px-5 text-base font-medium transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    background: tab === 'announcements' ? 'var(--text)' : 'transparent',
                    color: tab === 'announcements' ? 'var(--bg)' : 'var(--muted)',
                  }}
                >
                  {t('admin.tab.announcements')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'events'}
                  onClick={() => setTab('events')}
                  className="min-h-[52px] rounded-full border px-5 text-base font-medium transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    background: tab === 'events' ? 'var(--text)' : 'transparent',
                    color: tab === 'events' ? 'var(--bg)' : 'var(--muted)',
                  }}
                >
                  {t('admin.tab.events')}
                </button>
              </div>
              <button type="button" className="btn-secondary" onClick={() => { setUnlockedPin(''); setPin('') }}>
                {t('common.signOut')}
              </button>
            </div>

            <div className="mt-8 space-y-8">
              {tab === 'announcements' && <SheetAnnouncements adminPin={unlockedPin} />}
              {tab === 'events' && <SheetEvents adminPin={unlockedPin} />}
              <Link to="/" className="btn-link !justify-start">
                <ArrowLeft size={18} /> {t('admin.backToCircle')}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
