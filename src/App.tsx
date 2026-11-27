import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Layout } from './components/Layout'
import { EntryReel } from './components/EntryReel'
import { REPLAY_INTRO_EVENT } from './lib/intro'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const SundayMeditationPage = lazy(() =>
  import('./pages/SundayMeditationPage').then((m) => ({ default: m.SundayMeditationPage })),
)
const MaterialsPage = lazy(() => import('./pages/MaterialsPage').then((m) => ({ default: m.MaterialsPage })))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage })))
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const pageTitles: Record<string, string> = {
  '/': 'Sacred Circle — Free Sunday Meditation & Healing',
  '/about': 'About — Sacred Circle',
  '/sunday-meditation': 'Sunday Meditation — Sacred Circle',
  '/materials': 'Materials — Sacred Circle',
  '/reviews': 'Experiences — Sacred Circle',
  '/community': 'Community — Sacred Circle',
  '/admin': 'Admin Board — Sacred Circle',
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = pageTitles[pathname] ?? 'Page Not Found — Sacred Circle'
    const frame = window.requestAnimationFrame(() => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'auto' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])
  return null
}

function RouteFallback() {
  return (
    <section className="section-shell">
      <div className="card mx-auto max-w-xl text-center" role="status" aria-live="polite">
        <p style={{ color: 'var(--muted)' }}>Opening this page…</p>
      </div>
    </section>
  )
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const replay = () => setShowIntro(true)
    window.addEventListener(REPLAY_INTRO_EVENT, replay)
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, replay)
  }, [])

  const finishIntro = useCallback(() => setShowIntro(false), [])

  return (
    <>
      <ScrollToTop />
      <AnimatePresence>
        {showIntro && <EntryReel key="intro" onEnter={finishIntro} />}
      </AnimatePresence>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sunday-meditation" element={<SundayMeditationPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
