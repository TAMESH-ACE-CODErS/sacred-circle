import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import {
  createAnnouncement,
  createEvent,
  deleteAnnouncement,
  deleteEvent,
  fetchAnnouncements,
  fetchEvents,
} from '../../lib/siteContent'
import type { SheetAnnouncement, SheetEvent } from '../../types'
import {
  AdminActions,
  AdminField,
  AdminGrid,
  AdminList,
  AdminNotice,
  AdminPanel,
  AdminRow,
} from './AdminShared'

type Props = { adminPin: string }

const today = () => new Date().toISOString().slice(0, 10)

export function SheetAnnouncements({ adminPin }: Props) {
  const { t } = useLanguage()
  const [rows, setRows] = useState<SheetAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', date: today(), is_pinned: false })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const feed = await fetchAnnouncements()
      setRows(feed.rows)
      setError('')
    } catch {
      setError(t('admin.rowError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await createAnnouncement(
        {
          title: form.title.trim(),
          body: form.body.trim(),
          date: form.date,
          is_pinned: form.is_pinned,
        },
        adminPin,
      )
      setForm({ title: '', body: '', date: today(), is_pinned: false })
      setMessage(t('admin.saved'))
      await load()
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : t('admin.saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t('admin.confirmDelete'))) return
    try {
      await deleteAnnouncement(id, adminPin)
      setMessage(t('admin.deleted'))
      await load()
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : t('admin.saveError'))
    }
  }

  return (
    <AdminPanel title={t('admin.tab.announcements')} description={t('admin.announcementsHelp')}>
      <form onSubmit={submit}>
        <AdminGrid>
          <AdminField label={t('admin.titleLabel')} full>
            <input className="field" required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </AdminField>
          <AdminField label={t('admin.bodyLabel')} full>
            <textarea className="field min-h-[120px]" required maxLength={4000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} />
          </AdminField>
          <AdminField label={t('admin.dateLabel')}>
            <input className="field" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </AdminField>
          <label className="flex min-h-[52px] items-center gap-3">
            <input type="checkbox" className="h-5 w-5" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} />
            <span>{t('admin.pinnedLabel')}</span>
          </label>
          <AdminActions>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('admin.addAnnouncement')}
            </button>
            {message && <span className="text-base" role="status">{message}</span>}
          </AdminActions>
        </AdminGrid>
      </form>

      {error && <p className="mt-5 text-base text-red-800 dark:text-red-300">{error}</p>}
      {loading && <p className="mt-5 text-base" style={{ color: 'var(--muted)' }}>{t('admin.loadingRows')}</p>}
      <AdminList>
        {rows.map((row) => (
          <AdminRow
            key={row.id}
            title={row.title}
            meta={`${row.is_pinned ? `${t('announcements.pinned')} · ` : ''}${row.date}`}
            actions={
              <button
                className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-base"
                onClick={() => void remove(row.id)}
                aria-label={`${t('common.delete')}: ${row.title}`}
              >
                <Trash2 size={16} /> {t('common.delete')}
              </button>
            }
          />
        ))}
      </AdminList>
      {!loading && !rows.length && <div className="mt-5"><AdminNotice>{t('admin.noRows')}</AdminNotice></div>}
    </AdminPanel>
  )
}

export function SheetEvents({ adminPin }: Props) {
  const { t } = useLanguage()
  const [rows, setRows] = useState<SheetEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    date: today(),
    time: '2 Hrs',
    location_or_link: '',
    description: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const feed = await fetchEvents()
      setRows(feed.rows)
      setError('')
    } catch {
      setError(t('admin.rowError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await createEvent(
        {
          title: form.title.trim(),
          date: form.date,
          time: form.time.trim() || '2 Hrs',
          location_or_link: form.location_or_link.trim(),
          description: form.description.trim(),
        },
        adminPin,
      )
      setForm({ title: '', date: today(), time: '2 Hrs', location_or_link: '', description: '' })
      setMessage(t('admin.saved'))
      await load()
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : t('admin.saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t('admin.confirmDelete'))) return
    try {
      await deleteEvent(id, adminPin)
      setMessage(t('admin.deleted'))
      await load()
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : t('admin.saveError'))
    }
  }

  return (
    <AdminPanel title={t('admin.tab.events')} description={t('admin.eventsHelp')}>
      <form onSubmit={submit}>
        <AdminGrid>
          <AdminField label={t('admin.titleLabel')} full>
            <input className="field" required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </AdminField>
          <AdminField label={t('admin.dateLabel')}>
            <input className="field" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </AdminField>
          <AdminField label={t('admin.timeLabel')}>
            <input className="field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </AdminField>
          <AdminField label={t('admin.locationLabel')} full>
            <input className="field" maxLength={300} value={form.location_or_link} onChange={(e) => setForm({ ...form, location_or_link: e.target.value })} placeholder="https://…" />
          </AdminField>
          <AdminField label={t('admin.descriptionLabel')} full>
            <textarea className="field min-h-[120px]" maxLength={4000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
          </AdminField>
          <AdminActions>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('admin.addEvent')}
            </button>
            {message && <span className="text-base" role="status">{message}</span>}
          </AdminActions>
        </AdminGrid>
      </form>

      {error && <p className="mt-5 text-base text-red-800 dark:text-red-300">{error}</p>}
      {loading && <p className="mt-5 text-base" style={{ color: 'var(--muted)' }}>{t('admin.loadingRows')}</p>}
      <AdminList>
        {rows.map((row) => (
          <AdminRow
            key={row.id}
            title={row.title}
            meta={`${row.date} · ${row.time || '2 Hrs'}`}
            actions={
              <button
                className="btn-secondary !min-h-[44px] !px-4 !py-2 !text-base"
                onClick={() => void remove(row.id)}
                aria-label={`${t('common.delete')}: ${row.title}`}
              >
                <Trash2 size={16} /> {t('common.delete')}
              </button>
            }
          />
        ))}
      </AdminList>
      {!loading && !rows.length && <div className="mt-5"><AdminNotice>{t('admin.noRows')}</AdminNotice></div>}
    </AdminPanel>
  )
}
