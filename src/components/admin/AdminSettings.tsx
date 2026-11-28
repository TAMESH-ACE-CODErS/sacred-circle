import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useSiteContent } from '../../hooks/useSiteContent'
import { contactLinks, SUNDAY_SESSION_TIME } from '../../config/site'
import { defaultNavItems } from '../../config/navigation'
import { AdminActions, AdminField, AdminGrid, AdminNotice, AdminPanel } from './AdminShared'

export function AdminSettings() {
  const { refresh } = useSiteContent()
  const [navText, setNavText] = useState(JSON.stringify(defaultNavItems, null, 2))
  const [sundayTime, setSundayTime] = useState(SUNDAY_SESSION_TIME)
  const [youtube, setYoutube] = useState(contactLinks.youtube)
  const [whatsapp, setWhatsapp] = useState(contactLinks.whatsapp)
  const [email, setEmail] = useState(contactLinks.email)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (!active || !data) return
      const map = new Map(data.map((row) => [row.key, row.value]))
      const nav = map.get('nav_headers')
      const time = map.get('sunday_session_time')
      const links = map.get('contact_links') as Partial<typeof contactLinks> | undefined
      if (Array.isArray(nav)) setNavText(JSON.stringify(nav, null, 2))
      if (typeof time === 'string') setSundayTime(time)
      if (links) {
        setYoutube(links.youtube ?? contactLinks.youtube)
        setWhatsapp(links.whatsapp ?? contactLinks.whatsapp)
        setEmail(links.email ?? contactLinks.email)
      }
    })
    return () => {
      active = false
    }
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase || saving) return
    setSaving(true)
    setMessage('')

    let nav: unknown
    try {
      nav = JSON.parse(navText)
    } catch {
      setMessage('Navigation must be valid JSON.')
      setSaving(false)
      return
    }
    if (!Array.isArray(nav)) {
      setMessage('Navigation must be a JSON array of { label, href } items.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('site_settings').upsert([
      { key: 'nav_headers', value: nav },
      { key: 'sunday_session_time', value: sundayTime },
      {
        key: 'contact_links',
        value: { youtube, whatsapp, email },
      },
    ])

    if (error) setMessage(error.message)
    else {
      setMessage('Site settings saved.')
      await refresh()
    }
    setSaving(false)
  }

  return (
    <AdminPanel
      title="Site settings"
      description="Change navigation labels, the Sunday session time, and the three community links without touching code."
    >
      <AdminNotice>
        Changes appear everywhere after saving. Keep navigation items in the form{' '}
        <code>{'{ "label": "Home", "href": "/" }'}</code>.
      </AdminNotice>
      <form onSubmit={submit} className="mt-5">
        <AdminGrid>
          <AdminField label="Navigation items (JSON)" full>
            <textarea
              className="field min-h-[220px] font-mono !text-base"
              value={navText}
              onChange={(e) => setNavText(e.target.value)}
              spellCheck={false}
            />
          </AdminField>
          <AdminField label="Sunday session time" full>
            <input className="field" value={sundayTime} onChange={(e) => setSundayTime(e.target.value)} />
          </AdminField>
          <AdminField label="YouTube channel URL">
            <input className="field" type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
          </AdminField>
          <AdminField label="WhatsApp group URL">
            <input className="field" type="url" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </AdminField>
          <AdminField label="Contact email" full>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </AdminField>
          <AdminActions>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            {message && <span className="text-base" role="status">{message}</span>}
          </AdminActions>
        </AdminGrid>
      </form>
    </AdminPanel>
  )
}
