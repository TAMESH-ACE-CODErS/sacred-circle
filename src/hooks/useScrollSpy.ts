import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { routeSectionMap, siteSections, type SectionId } from '../config/navigation'

/**
 * Follows the visible homepage section so seniors always know where they are.
 * MutationObserver re-attaches when the lazily-loaded homepage arrives.
 */
export function useScrollSpy(): SectionId {
  const { pathname } = useLocation()
  const [active, setActive] = useState<SectionId>('home')

  useEffect(() => {
    if (pathname !== '/') {
      setActive(routeSectionMap[pathname] ?? 'home')
      return
    }

    setActive('home')
    const ids = siteSections.map((section) => section.id)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id as SectionId)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.05, 0.2, 0.5] },
    )
    const observed = new Set<Element>()

    const attach = () => {
      ids.forEach((id) => {
        const element = document.getElementById(id)
        if (element && element.isConnected && !observed.has(element)) {
          observed.add(element)
          observer.observe(element)
        }
      })
    }

    attach()
    const mutations = new MutationObserver(attach)
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
      observed.clear()
    }
  }, [pathname])

  return active
}
