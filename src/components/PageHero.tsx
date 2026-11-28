import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  eyebrow: string
  title: string
  description: ReactNode
  children?: ReactNode
  image?: string
  imageAlt?: string
}

export function PageHero({ eyebrow, title, description, children, image, imageAlt = '' }: Props) {
  return (
    <section className="relative overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="hero-grain absolute inset-0" aria-hidden="true" />
      <div className="section-shell relative grid gap-8 py-12 sm:gap-10 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="!text-[2.6rem] sm:!text-[4rem]">{title}</h1>
          <div className="mt-6 max-w-2xl text-lg sm:text-xl" style={{ color: 'var(--muted)' }}>
            {description}
          </div>
          {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
        </motion.div>
        {image && (
          <motion.div
            className="relative mx-auto w-full max-w-md"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute -inset-3 rounded-[2.5rem]" style={{ background: 'var(--surface-2)' }} aria-hidden="true" />
            <img
              src={image}
              alt={imageAlt}
              className="card relative aspect-[4/5] w-full overflow-hidden !p-0 object-cover object-top"
              loading="lazy"
            />
          </motion.div>
        )}
      </div>
    </section>
  )
}
