import { useState, type FormEvent } from 'react'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSiteContent } from '../../hooks/useSiteContent'
import type { Material } from '../../types'
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

type AdminMaterial = Material & {
  pin_code: string | null
  is_published: boolean
  created_at?: string
}

const empty = {
  title: '',
  description: '',
  media_type: 'video',
  media_url: '',
  thumbnail_url: '',
  pin_code: '',
  category: 'Meditation',
  is_published: true,
}

export function AdminMaterials() {
  const { reload, rows, error, loading } = useAdminRows<AdminMaterial>('materials')
  const { refresh } = useSiteContent()
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function edit(row: AdminMaterial) {
    setEditingId(row.id)
    setForm({
      title: row.title,
      description: row.description,
      media_type: row.media_type,
      media_url: row.media_url ?? '',
      thumbnail_url: row.thumbnail_url ?? '',
      pin_code: row.pin_code ?? '',
      category: row.category,
      is_published: row.is_published,
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

    const pin = form.pin_code.trim()
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      media_type: form.media_type,
      media_url: form.media_url.trim(),
      thumbnail_url: form.thumbnail_url.trim(),
      pin_code: pin || null,
      category: form.category.trim() || 'Meditation',
      is_published: form.is_published,
    }

    if (pin && !payload.media_url) {
      setMessage('Add a media URL for a PIN-protected item.')
      setSaving(false)
      return
    }

    const result = editingId
      ? await supabase.from('materials').update(payload).eq('id', editingId)
      : await supabase.from('materials').insert(payload)

    if (result.error) {
      setMessage(result.error.message)
    } else {
      setMessage(editingId ? 'Material updated.' : 'Material added.')
      reset()
      await Promise.all([reload(), refresh()])
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!supabase || !window.confirm('Remove this material?')) return
    const { error: deleteError } = await supabase.from('materials').delete().eq('id', id)
    if (deleteError) setMessage(deleteError.message)
    else await Promise.all([reload(), refresh()])
  }

  return (
    <AdminPanel
      title="Materials library"
      description="Public items appear in the gallery. Locked items only reveal their media when the PIN matches the secure check."
    >
      <AdminNotice>
        Leave the PIN blank for public items. Never place a private URL in a public announcement or review.
      </AdminNotice>

      <form onSubmit={submit} className="mt-5">
        <AdminGrid>
          <AdminField label="Title">
            <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </AdminField>
          <AdminField label="Category">
            <input className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </AdminField>
          <AdminField label="Description" full>
            <textarea
              className="field min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminField>
          <AdminField label="Media type">
            <select
              className="field"
              value={form.media_type}
              onChange={(e) => setForm({ ...form, media_type: e.target.value })}
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </AdminField>
          <AdminField label="PIN (blank = public)">
            <input
              className="field"
              type="password"
              autoComplete="off"
              value={form.pin_code}
              onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
              placeholder="Optional"
            />
          </AdminField>
          <AdminField label="Media URL" full>
            <input
              className="field"
              type="url"
              value={form.media_url}
              onChange={(e) => setForm({ ...form, media_url: e.target.value })}
              placeholder="https://… or /path/to/file"
              required
            />
          </AdminField>
          <AdminField label="Thumbnail URL" full>
            <input
              className="field"
              type="url"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
              placeholder="https://…"
            />
          </AdminField>
          <label className="flex min-h-[52px] items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="h-5 w-5"
            />
            <span>Published</span>
          </label>
          <AdminActions>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add material'}
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
            title={row.title}
            meta={`${row.category} · ${row.media_type}${row.pin_code ? ' · PIN protected' : ' · Public'}${row.is_published ? '' : ' · Hidden'}`}
            actions={
              <>
                {row.media_url && (
                  <a
                    className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-sm"
                    href={row.media_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={15} /> Open
                  </a>
                )}
                <button className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-sm" onClick={() => edit(row)}>
                  <Pencil size={15} /> Edit
                </button>
                <button
                  className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-sm"
                  onClick={() => remove(row.id)}
                  aria-label={`Delete material: ${row.title}`}
                >
                  <Trash2 size={15} />
                </button>
              </>
            }
          />
        ))}
      </AdminList>
      {!loading && !rows.length && <div className="mt-5"><AdminNotice>No materials yet.</AdminNotice></div>}
    </AdminPanel>
  )
}
