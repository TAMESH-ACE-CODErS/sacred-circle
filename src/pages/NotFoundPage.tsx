import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <section className="section-shell max-w-2xl text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="!text-3xl">This corner of the circle is quiet</h1>
      <p className="mt-5 text-lg" style={{ color: 'var(--muted)' }}>
        The page you were looking for has moved or was never here. The rest of the circle is still
        open.
      </p>
      <Link to="/" className="btn-primary mt-8"><ArrowLeft size={18} /> Return home</Link>
    </section>
  )
}
