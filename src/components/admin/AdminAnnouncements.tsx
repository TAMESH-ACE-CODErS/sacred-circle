import { useState, type FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Announcement } from '../../types'
import { useSiteContent } from '../../hooks/useSiteContent'
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

const empty = {
  message_en: '',
  message_hi: '',
  link_url: '',
  event_date: '',
  is_active: true,
}

export function AdminAnnouncements() {
  const { reload, rows, error, loading } = useAdminRows<Announcement>('announcements')
  const { refresh } = useSiteContent()
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function edit(row: Announcement) {
    setEditingId(row.id)
    setForm({
      message_en: row.message_en,
      message_hi: row.message_hi ?? '',
      link_url: row.link_url ?? '',
      event_date: row.event_date ? row.event_date.slice(0, 16) : '',
      is_active: row.is_active,
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
      message_en: form.message_en.trim(),
      message_hi: form.message_hi.trim() || null,
      link_url: form.link_url.trim() || null,
      event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      is_active: form.is_active,
    }

    const result = editingId
      ? await supabase.from('announcements').update(payload).eq('id', editingId)
      : await supabase.from('announcements').insert(payload)

    if (result.error) {
      setMessage(result.error.message)
    } else {
      setMessage(editingId ? 'Announcement updated.' : 'Announcement added.')
      reset()
      await Promise.all([reload(), refresh()])
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!supabase || !window.confirm('Remove this announcement?')) return
    const { error: deleteError } = await supabase.from('announcements').delete().eq('id', id)
    if (deleteError) setMessage(deleteError.message)
    else await Promise.all([reload(), refresh()])
  }

  async function toggle(row: Announcement) {
    if (!supabase) return
    const { error: updateError } = await supabase
      .from('announcements')
      .update({ is_active: !row.is_active })
      .eq('id', row.id)
    if (updateError) setMessage(updateError.message)
    else await Promise.all([reload(), refresh()])
  }

  return (
    <AdminPanel
      title="Announcements"
      description="The active announcement appears quietly at the top of every public page."
    >
      <form onSubmit={submit}>
        <AdminGrid>
          <AdminField label="Message (English)" full>
            <input
              className="field"
              value={form.message_en}
              onChange={(event) => setForm({ ...form, message_en: event.target.value })}
              required
            />
          </AdminField>
          <AdminField label="Message (हिन्दी)" full>
            <input
              className="field devanagari"
              value={form.message_hi}
              onChange={(event) => setForm({ ...form, message_hi: event.target.value })}
            />
          </AdminField>
          <AdminField label="Link URL (optional)">
            <input
              className="field"
              type="url"
              value={form.link_url}
              onChange={(event) => setForm({ ...form, link_url: event.target.value })}
              placeholder="https://…"
            />
          </AdminField>
          <AdminField label="Event time (optional)">
            <input
              className="field"
              type="datetime-local"
              value={form.event_date}
              onChange={(event) => setForm({ ...form, event_date: event.target.value })}
            />
          </AdminField>
          <label className="flex min-h-[52px] items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
              className="h-5 w-5"
            />
            <span>Show this announcement publicly</span>
          </label>
          <AdminActions>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add announcement'}
            </button>
            {editingId && <button className="btn-secondary" type="button" onClick={reset}>Cancel</button>}
            {message && <span className="text-base" role="status">{message}</span>}
          </AdminActions>
        </AdminGrid>
      </form>

      {error && <p className="mt-5 text-base text-red-700 dark:text-red-300">{error}</p>}
      {loading && <p className="mt-5 text-base" style={{ color: 'var(--muted)' }}>Loading…</p>}

      <AdminList>
        {rows.map((row) => (
          <AdminRow
            key={row.id}
            title={row.message_en}
            meta={`${row.is_active ? 'Active' : 'Hidden'}${row.event_date ? ` · ${new Date(row.event_date).toLocaleString()}` : ''}`}
            actions={
              <>
                <button className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-base" onClick={() => edit(row)}>
                  <Pencil size={15} /> Edit
                </button>
                <button className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-base" onClick={() => toggle(row)}>
                  {row.is_active ? 'Hide' : 'Activate'}
                </button>
                <button
                  className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-base"
                  onClick={() => remove(row.id)}
                  aria-label={`Delete announcement: ${row.message_en}`}
                >
                  <Trash2 size={15} />
                </button>
              </>
            }
          />
        ))}
      </AdminList>
      {!loading && !rows.length && <div className="mt-5"><AdminNotice>No announcements yet.</AdminNotice></div>}
    </AdminPanel>
  )
}
