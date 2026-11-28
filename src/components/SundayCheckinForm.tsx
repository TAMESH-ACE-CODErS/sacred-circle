import { useState, type FormEvent } from 'react'
import { CalendarCheck2, Send } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { currentVisitorContext, trackVisitorEvent } from '../lib/sheetTracker'
import { submitCheckin } from '../lib/siteContent'
import type { TranslationKey } from '../i18n/translations'

const ageGroups: TranslationKey[] = [
  'checkin.age40',
  'checkin.age50',
  'checkin.age60',
  'checkin.age70',
]

const interests: TranslationKey[] = [
  'checkin.interestSunday',
  'checkin.interestHealing',
  'checkin.interestAudio',
  'checkin.interestCommunity',
]

type FormState = {
  name: string
  phone_whatsapp: string
  email: string
  city: string
  age_group: string
  profession_role: string
  company_or_business: string
  website_or_linkedin: string
  interest_area: string
  referral_source: string
  open_to_connect: boolean
}

const emptyForm: FormState = {
  name: '',
  phone_whatsapp: '',
  email: '',
  city: '',
  age_group: '',
  profession_role: '',
  company_or_business: '',
  website_or_linkedin: '',
  interest_area: '',
  referral_source: '',
  open_to_connect: false,
}

export function SundayCheckinForm() {
  const { t } = useLanguage()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  function update(key: keyof FormState, value: string | boolean): void {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const name = form.name.trim()
    const phone = form.phone_whatsapp.trim()
    const email = form.email.trim()

    if (!name && !phone && !email) {
      setError(t('checkin.contactRequired'))
      setNotice('')
      return
    }

    setSending(true)
    setError('')
    setNotice('')
    try {
      await submitCheckin({
        name,
        phone_whatsapp: phone,
        email,
        city: form.city.trim(),
        age_group: form.age_group,
        profession_role: form.profession_role.trim(),
        company_or_business: form.company_or_business.trim(),
        website_or_linkedin: form.website_or_linkedin.trim(),
        interest_area: form.interest_area,
        referral_source: form.referral_source.trim(),
        open_to_connect: form.open_to_connect,
        ...currentVisitorContext(),
      })
      setNotice(t('checkin.success'))
      setForm(emptyForm)
      trackVisitorEvent('sunday_cta_click', { eventDetail: 'Sunday check-in submitted' })
    } catch {
      setError(t('checkin.error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div id="sunday-checkin" className="soft-panel mt-6 scroll-mt-40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow !mb-2">{t('checkin.eyebrow')}</p>
          <h3 className="!text-2xl">{t('checkin.title')}</h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            {t('checkin.description')}
          </p>
        </div>
        <CalendarCheck2 size={34} className="shrink-0" style={{ color: 'var(--accent-strong)' }} aria-hidden="true" />
      </div>

      <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="checkin-name" className="mb-2 block text-base font-semibold">{t('checkin.nameLabel')}</label>
          <input
            id="checkin-name"
            className="field"
            type="text"
            value={form.name}
            maxLength={80}
            autoComplete="name"
            onChange={(event) => update('name', event.target.value)}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="checkin-phone" className="mb-2 block text-base font-semibold">{t('checkin.phoneLabel')}</label>
          <input
            id="checkin-phone"
            className="field"
            type="tel"
            value={form.phone_whatsapp}
            maxLength={60}
            autoComplete="tel"
            onChange={(event) => update('phone_whatsapp', event.target.value)}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="checkin-email" className="mb-2 block text-base font-semibold">{t('checkin.emailLabel')}</label>
          <input
            id="checkin-email"
            className="field"
            type="email"
            value={form.email}
            maxLength={160}
            autoComplete="email"
            onChange={(event) => update('email', event.target.value)}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="checkin-city" className="mb-2 block text-base font-semibold">{t('checkin.cityLabel')}</label>
          <input
            id="checkin-city"
            className="field"
            type="text"
            value={form.city}
            maxLength={100}
            autoComplete="address-level2"
            onChange={(event) => update('city', event.target.value)}
          />
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label htmlFor="checkin-open" className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-base font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <input
              id="checkin-open"
              type="checkbox"
              checked={form.open_to_connect}
              onChange={(event) => update('open_to_connect', event.target.checked)}
              className="h-6 w-6 shrink-0 accent-current"
            />
            <span>{t('checkin.openLabel')}</span>
          </label>
        </div>

        <details className="min-w-0 sm:col-span-2">
          <summary className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-full border px-5 text-base font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            {t('checkin.moreDetails')}
          </summary>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="checkin-age" className="mb-2 block text-base font-semibold">{t('checkin.ageLabel')}</label>
              <select id="checkin-age" className="field" value={form.age_group} onChange={(event) => update('age_group', event.target.value)}>
                <option value="">—</option>
                {ageGroups.map((key) => (
                  <option key={key} value={t(key)}>{t(key)}</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label htmlFor="checkin-interest" className="mb-2 block text-base font-semibold">{t('checkin.interestLabel')}</label>
              <select id="checkin-interest" className="field" value={form.interest_area} onChange={(event) => update('interest_area', event.target.value)}>
                <option value="">—</option>
                {interests.map((key) => (
                  <option key={key} value={t(key)}>{t(key)}</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label htmlFor="checkin-profession" className="mb-2 block text-base font-semibold">{t('checkin.professionLabel')}</label>
              <input id="checkin-profession" className="field" type="text" value={form.profession_role} maxLength={120} onChange={(event) => update('profession_role', event.target.value)} />
            </div>

            <div className="min-w-0">
              <label htmlFor="checkin-company" className="mb-2 block text-base font-semibold">{t('checkin.companyLabel')}</label>
              <input id="checkin-company" className="field" type="text" value={form.company_or_business} maxLength={160} onChange={(event) => update('company_or_business', event.target.value)} />
            </div>

            <div className="min-w-0">
              <label htmlFor="checkin-website" className="mb-2 block text-base font-semibold">{t('checkin.websiteLabel')}</label>
              <input id="checkin-website" className="field" type="text" value={form.website_or_linkedin} maxLength={300} onChange={(event) => update('website_or_linkedin', event.target.value)} />
            </div>

            <div className="min-w-0">
              <label htmlFor="checkin-referral" className="mb-2 block text-base font-semibold">{t('checkin.referralLabel')}</label>
              <input id="checkin-referral" className="field" type="text" value={form.referral_source} maxLength={160} onChange={(event) => update('referral_source', event.target.value)} />
            </div>
          </div>
        </details>

        <div className="min-w-0 sm:col-span-2">
          {notice && <p className="mb-4 text-base font-semibold text-green-800 dark:text-green-300" role="status">{notice}</p>}
          {error && <p className="mb-4 text-base font-semibold text-red-800 dark:text-red-300" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full !min-h-[56px]" disabled={sending}>
            <Send size={19} aria-hidden="true" />
            {sending ? t('checkin.sending') : t('checkin.submit')}
          </button>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>{t('checkin.privacy')}</p>
        </div>
      </form>
    </div>
  )
}
