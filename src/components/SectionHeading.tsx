import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: string
  description?: ReactNode
  centered?: boolean
}

export function SectionHeading({ eyebrow, title, description, centered = false }: Props) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && (
        <p className="mt-5 text-lg" style={{ color: 'var(--muted)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
