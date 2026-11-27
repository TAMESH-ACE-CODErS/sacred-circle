import { useState } from 'react'
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import { isSupabaseConfigured } from '../lib/supabase'
import { AdminAnnouncements } from '../components/admin/AdminAnnouncements'
import { AdminMaterials } from '../components/admin/AdminMaterials'
import { AdminReviews } from '../components/admin/AdminReviews'
import { AdminSettings } from '../components/admin/AdminSettings'

type Tab = 'announcements' | 'materials' | 'reviews' | 'settings'

const tabs: { id: Tab; label: string }[] = [
  { id: 'announcements', label: 'Announcements' },
  { id: 'materials', label: 'Materials' },
  { id: 'reviews', label: 'Experiences' },
  { id: 'settings', label: 'Settings' },
]

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('announcements')
  const admin = useAdmin()

  if (!isSupabaseConfigured) {
    return (
      <section className="section-shell max-w-4xl">
        <div className="card">
          <p className="eyebrow">Admin board</p>
          <h1 className="!text-3xl">Connect Supabase to manage content</h1>
          <p className="mt-5 text-lg" style={{ color: 'var(--muted)' }}>
            The public site works with built-in sample content. To enable Google sign-in, private PIN
            verification and editing, copy <code>.env.example</code> to <code>.env.local</code>, add your
            project values, then run <code>supabase/schema.sql</code> in the Supabase SQL editor.
          </p>
          <ol className="mt-6 list-decimal space-y-2 pl-6 text-lg" style={{ color: 'var(--muted)' }}>
            <li>Create a Supabase project and enable Google as an auth provider.</li>
            <li>Run <code>supabase/schema.sql</code>.</li>
            <li>Add the allowlisted admin Gmail addresses in <code>admin_allowlist</code>.</li>
            <li>Restart the dev server and sign in below.</li>
          </ol>
          <Link to="/" className="btn-primary mt-8"><ArrowLeft size={18} /> Back to the circle</Link>
        </div>
      </section>
    )
  }

  if (admin.loading) {
    return (
      <section className="section-shell">
        <div className="card mx-auto max-w-xl text-center">
          <p className="text-lg" style={{ color: 'var(--muted)' }}>Checking your access…</p>
        </div>
      </section>
    )
  }

  if (!admin.signedIn) {
    return (
      <section className="section-shell max-w-3xl">
        <div className="card text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
            <ShieldCheck size={26} />
          </span>
          <p className="eyebrow mt-6">Private area</p>
          <h1 className="!text-3xl">Admin board</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg" style={{ color: 'var(--muted)' }}>
            This area is open only to Gmail addresses listed in the admin allowlist. Visitors never
            need to sign in.
          </p>
          {admin.error && <p className="mt-4 text-sm text-red-700 dark:text-red-300">{admin.error}</p>}
          <button type="button" onClick={admin.signIn} className="btn-primary mt-8">
            Continue with Google
          </button>
          <div className="mt-6"><Link to="/" className="btn-link">Back to the circle</Link></div>
        </div>
      </section>
    )
  }

  if (!admin.isAdmin) {
    return (
      <section className="section-shell max-w-3xl">
        <div className="card text-center">
          <h1 className="!text-3xl">This account is not on the allowlist</h1>
          <p className="mt-5 text-lg" style={{ color: 'var(--muted)' }}>
            You are signed in as <strong>{admin.user?.email}</strong>. Ask an administrator to add this
            Gmail address to <code>admin_allowlist</code>, then refresh this page.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button type="button" onClick={admin.signOut} className="btn-secondary"><LogOut size={18} /> Sign out</button>
            <Link to="/" className="btn-primary">Back to the circle</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-shell !py-12 sm:!py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Private area</p>
          <h1 className="!text-3xl sm:!text-4xl">Admin board</h1>
          <p className="mt-3" style={{ color: 'var(--muted)' }}>Signed in as {admin.user?.email}</p>
        </div>
        <button type="button" onClick={admin.signOut} className="btn-secondary">
          <LogOut size={18} /> Sign out
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
        {tabs.map((item) => (
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
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {tab === 'announcements' && <AdminAnnouncements />}
        {tab === 'materials' && <AdminMaterials />}
        {tab === 'reviews' && <AdminReviews />}
        {tab === 'settings' && <AdminSettings />}
      </div>
    </section>
  )
}
