import { useState, type FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSiteContent } from '../../hooks/useSiteContent'
import type { Review } from '../../types'
import {
  AdminActions,
  AdminField,
  AdminGrid,
  AdminList,
  AdminNotice,
  AdminPanel,
  AdminRow,
  useAdminRows,
} from './AdminShared'

type AdminReview = Review & { is_visible: boolean }

const empty = {
  reviewer_name: '',
  review_text: '',
  avatar_key: 'reviewerF',
  sort_order: 0,
  is_visible: true,
}

export function AdminReviews() {
  const { reload, rows, error, loading } = useAdminRows<AdminReview>('reviews', 'sort_order')
  const { refresh } = useSiteContent()
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function edit(row: AdminReview) {
    setEditingId(row.id)
    setForm({
      reviewer_name: row.reviewer_name,
      review_text: row.review_text,
      avatar_key: row.avatar_key,
      sort_order: row.sort_order,
      is_visible: row.is_visible,
    })
  }

  function reset() {
    setForm(empty)
    setEditingId(null)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase || saving) return
    setSaving(true)
    setMessage('')

    const payload = {
      reviewer_name: form.reviewer_name.trim(),
      review_text: form.review_text.trim(),
      avatar_key: form.avatar_key,
      sort_order: Number(form.sort_order) || 0,
      is_visible: form.is_visible,
    }

    const result = editingId
      ? await supabase.from('reviews').update(payload).eq('id', editingId)
      : await supabase.from('reviews').insert(payload)

    if (result.error) {
      setMessage(result.error.message)
    } else {
      setMessage(editingId ? 'Experience updated.' : 'Experience added.')
      reset()
      await Promise.all([reload(), refresh()])
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!supabase || !window.confirm('Remove this experience?')) return
    const { error: deleteError } = await supabase.from('reviews').delete().eq('id', id)
    if (deleteError) setMessage(deleteError.message)
    else await Promise.all([reload(), refresh()])
  }

  return (
    <AdminPanel
      title="Community experiences"
      description="Publish the words people have chosen to share. English and Hindi are both welcome."
    >
      <form onSubmit={submit}>
        <AdminGrid>
          <AdminField label="Name and place">
            <input
              className="field"
              value={form.reviewer_name}
              onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
              required
            />
          </AdminField>
          <AdminField label="Order">
            <input
              className="field"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </AdminField>
          <AdminField label="Photo group">
            <select
              className="field"
              value={form.avatar_key}
              onChange={(e) => setForm({ ...form, avatar_key: e.target.value })}
            >
              <option value="reviewerM">reviewerM</option>
              <option value="reviewerF">reviewerF</option>
              <option value="reviewerMF">reviewerMF</option>
            </select>
          </AdminField>
          <AdminField label="Experience" full>
            <textarea
              className="field min-h-[160px]"
              value={form.review_text}
              onChange={(e) => setForm({ ...form, review_text: e.target.value })}
              required
            />
          </AdminField>
          <label className="flex min-h-[52px] items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
              className="h-5 w-5"
            />
            <span>Visible on the site</span>
          </label>
          <AdminActions>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add experience'}
            </button>
            {editingId && <button className="btn-secondary" type="button" onClick={reset}>Cancel</button>}
            {message && <span className="text-sm" role="status">{message}</span>}
          </AdminActions>
        </AdminGrid>
      </form>

      {error && <p className="mt-5 text-sm text-red-700 dark:text-red-300">{error}</p>}
      {loading && <p className="mt-5 text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>}

      <AdminList>
        {rows.map((row) => (
          <AdminRow
            key={row.id}
            title={row.reviewer_name}
            meta={`${row.is_visible ? 'Visible' : 'Hidden'} · ${row.review_text.slice(0, 110)}…`}
            actions={
              <>
                <button className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-sm" onClick={() => edit(row)}>
                  <Pencil size={15} /> Edit
                </button>
                <button
                  className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-sm"
                  onClick={() => remove(row.id)}
                  aria-label={`Delete experience from ${row.reviewer_name}`}
                >
                  <Trash2 size={15} />
                </button>
              </>
            }
          />
        ))}
      </AdminList>
      {!loading && !rows.length && <div className="mt-5"><AdminNotice>No experiences yet.</AdminNotice></div>}
    </AdminPanel>
  )
}
