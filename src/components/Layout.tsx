import { Outlet } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { FloatingActions } from './FloatingActions'
import { ConnectPrompt } from './ConnectPrompt'

export function Layout({ connectEnabled = false }: { connectEnabled?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-24 sm:pb-28">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
      <ConnectPrompt enabled={connectEnabled} />
    </div>
  )
}
