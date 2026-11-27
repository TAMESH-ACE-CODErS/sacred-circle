import { useState } from 'react'
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import { isSupabaseConfigured } from '../lib/supabase'
import { useLanguage } from '../context/LanguageContext'
import { AdminAnnouncements } from '../components/admin/AdminAnnouncements'
import { AdminMaterials } from '../components/admin/AdminMaterials'
import { AdminReviews } from '../components/admin/AdminReviews'
import { AdminSettings } from '../components/admin/AdminSettings'
import { AdminQuotes } from '../components/admin/AdminQuotes'
import type { TranslationKey } from '../i18n/translations'

type Tab = 'announcements' | 'materials' | 'reviews' | 'quotes' | 'settings'

const tabs: { id: Tab; labelKey: TranslationKey }[] = [
  { id: 'announcements', labelKey: 'admin.tab.announcements' },
  { id: 'materials', labelKey: 'admin.tab.materials' },
  { id: 'reviews', labelKey: 'admin.tab.reviews' },
  { id: 'quotes', labelKey: 'admin.tab.quotes' },
  { id: 'settings', labelKey: 'admin.tab.settings' },
]

export function AdminPage() {
  const [tab, setTab] = useState<Tab>(() => (isSupabaseConfigured ? 'announcements' : 'quotes'))
  const admin = useAdmin()
  const { t } = useLanguage()
  const signedInAdmin = isSupabaseConfigured && admin.signedIn && admin.isAdmin
  const visibleTabs = isSupabaseConfigured ? tabs : tabs.filter((item) => item.id === 'quotes')

  return (
    <section className="section-shell !py-12 sm:!py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{t('admin.privateArea')}</p>
          <h1 className="!text-3xl sm:!text-4xl">{t('footer.admin')}</h1>
          {signedInAdmin && (
            <p className="mt-3" style={{ color: 'var(--muted)' }}>
              {t('admin.signedInAs')} {admin.user?.email}
            </p>
          )}
        </div>
        {admin.signedIn && (
          <button type="button" onClick={admin.signOut} className="btn-secondary">
            <LogOut size={18} /> {t('common.signOut')}
          </button>
        )}
      </div>

      {!isSupabaseConfigured && (
        <div className="card mt-8">
          <h2 className="!text-2xl">{t('common.adminSupabaseTitle')}</h2>
          <p className="mt-3 text-lg" style={{ color: 'var(--muted)' }}>
            {t('common.adminSupabaseBody')}
          </p>
          <details className="mt-4">
            <summary className="min-h-[48px] cursor-pointer font-semibold">
              {t('common.readAll')}
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg" style={{ color: 'var(--muted)' }}>
              <li>Create a Supabase project and enable Google as an auth provider.</li>
              <li>Run <code>supabase/schema.sql</code>.</li>
              <li>Add the allowlisted admin Gmail addresses in <code>admin_allowlist</code>.</li>
              <li>Restart the dev server, then sign in with the allowlisted Gmail account.</li>
            </ol>
          </details>
          <Link to="/" className="btn-link mt-4 !justify-start">
            <ArrowLeft size={18} /> {t('admin.backToCircle')}
          </Link>
        </div>
      )}

      {isSupabaseConfigured && admin.loading && (
        <div className="card mt-8">
          <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('common.checkingAccess')}</p>
        </div>
      )}

      {isSupabaseConfigured && !admin.loading && !admin.signedIn && (
        <div className="card mt-8 text-center">
          <span
            className="inline-flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
          >
            <ShieldCheck size={26} />
          </span>
          <h2 className="mt-5 !text-2xl">{t('footer.admin')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: 'var(--muted)' }}>
            {t('admin.signInBody')}
          </p>
          {admin.error && <p className="mt-4 text-base text-red-800 dark:text-red-300">{admin.error}</p>}
          <button type="button" onClick={admin.signIn} className="btn-primary mt-7">
            {t('common.signInGoogle')}
          </button>
          <div className="mt-5"><Link to="/" className="btn-link">{t('admin.backToCircle')}</Link></div>
        </div>
      )}

      {isSupabaseConfigured && !admin.loading && admin.signedIn && !admin.isAdmin && (
        <div className="card mt-8 text-center">
          <h2 className="!text-2xl">{t('common.notAdminTitle')}</h2>
          <p className="mt-5 text-lg" style={{ color: 'var(--muted)' }}>
            {t('common.notAdminBody').replace('{email}', admin.user?.email ?? '')}
          </p>
          <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>{t('admin.allowlistBody')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button type="button" onClick={admin.signOut} className="btn-secondary">
              <LogOut size={18} /> {t('common.signOut')}
            </button>
            <Link to="/" className="btn-primary">{t('admin.backToCircle')}</Link>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label={t('admin.privateArea')}>
        {visibleTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className="min-h-[52px] rounded-full border px-5 text-base font-medium transition-colors"
            style={{
              borderColor: 'var(--border)',
              background: tab === item.id ? 'var(--text)' : 'transparent',
              color: tab === item.id ? 'var(--bg)' : 'var(--muted)',
            }}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {tab === 'quotes' && <AdminQuotes />}
        {tab !== 'quotes' && !signedInAdmin && (
          <div className="card">
            <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('admin.supabaseOnly')}</p>
          </div>
        )}
        {signedInAdmin && tab === 'announcements' && <AdminAnnouncements />}
        {signedInAdmin && tab === 'materials' && <AdminMaterials />}
        {signedInAdmin && tab === 'reviews' && <AdminReviews />}
        {signedInAdmin && tab === 'settings' && <AdminSettings />}
      </div>
    </section>
  )
}
