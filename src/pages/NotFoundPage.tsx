import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <section className="section-shell max-w-2xl text-center">
      <p className="eyebrow">{t('notFound.eyebrow')}</p>
      <h1 className="!text-3xl">{t('notFound.title')}</h1>
      <p className="mt-5 text-lg" style={{ color: 'var(--muted)' }}>
        {t('notFound.description')}
      </p>
      <Link to="/" className="btn-primary mt-8"><ArrowLeft size={18} /> {t('notFound.cta')}</Link>
    </section>
  )
}
