import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminPanel({ title, description, children }: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="card !p-6 sm:!p-8">
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>{description}</p>
      <div className="mt-7">{children}</div>
    </section>
  )
}

export function AdminGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-2">{children}</div>
}

export function AdminField({ label, children, full = false }: {
  label: string
  children: ReactNode
  full?: boolean
}) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="mb-2 block text-base font-semibold">{label}</span>
      {children}
    </label>
  )
}

export function AdminActions({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-wrap items-center gap-3 sm:col-span-2">{children}</div>
}

export function AdminRow({ title, meta, actions }: {
  title: string
  meta: string
  actions: ReactNode
}) {
  return (
    <li
      className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-1 truncate text-base" style={{ color: 'var(--muted)' }}>{meta}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
    </li>
  )
}

export function AdminList({ children }: { children: ReactNode }) {
  return <ul className="mt-6 space-y-3">{children}</ul>
}

export function AdminNotice({ children }: { children: ReactNode }) {
  return (
    <p
      className="rounded-xl border px-4 py-3 text-base"
      style={{ borderColor: 'var(--border)', background: 'var(--accent-soft)' }}
    >
      {children}
    </p>
  )
}

export function useAdminRows<T>(table: string, orderColumn = 'created_at') {
  const [rows, setRows] = useState<T[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error: queryError } = await supabase.from(table).select('*').order(orderColumn, { ascending: false })
    if (queryError) {
      setError(queryError.message)
    } else {
      setRows((data ?? []) as T[])
      setError('')
    }
    setLoading(false)
  }, [table, orderColumn])

  useEffect(() => {
    void load()
  }, [load])

  return { rows, error, loading, reload: load }
}
