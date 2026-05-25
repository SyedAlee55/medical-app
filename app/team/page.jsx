import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export const metadata = {
  title: "Team — Tj's Medical Hub",
  description: 'Meet the team behind Tj\'s Medical Hub.',
}

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-lg text-center">
          <h1 className="type-h2 text-zinc-900 mb-3">Our Team</h1>
          <p className="type-body text-zinc-500 text-sm">
            This page is coming soon.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
