import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl text-center space-y-8 animate-fade-in">
        {/* Badge or micro-copy */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
          ✨ Welcome to Tj's Medical Hub
        </span>

        {/* Hero Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white leading-none">
          Professional Care,{' '}
          <span className="text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Simplified.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Experience genuine care combined with state-of-the-art clinic management. Book appointments directly as a guest or log in to manage your healthcare journey.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/schedule" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/10 hover:shadow-lg transition-all duration-200">
              Book Guest Appointment
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full font-medium border-slate-200 hover:bg-slate-100 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors">
              Patient Portal Login
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust elements or stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-zinc-800 text-center text-sm text-zinc-500 max-w-2xl w-full">
        <div>
          <span className="block text-2xl font-bold text-slate-900 dark:text-zinc-100">24/7</span>
          Coordination & Support
        </div>
        <div>
          <span className="block text-2xl font-bold text-slate-900 dark:text-zinc-100">Direct</span>
          Doctor Scheduling
        </div>
        <div className="col-span-2 md:col-span-1">
          <span className="block text-2xl font-bold text-slate-900 dark:text-zinc-100">Instant</span>
          Email Notifications
        </div>
      </div>
    </div>
  )
}
