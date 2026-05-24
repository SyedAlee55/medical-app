import CalendlyWidget from '@/components/CalendlyWidget'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function GuestBookingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* ── Centered header + banner ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight sm:text-4xl">
            Book an Appointment
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Fill in the form below to request an appointment. Our team will review your
            request and assign the right doctor for you. Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 underline transition-colors"
            >
              Sign in here
            </Link>{' '}
            to book directly with your preferred doctor.
          </p>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
              This form is for new or guest patients. If you are a registered patient,
              logging in allows you to book directly with specific doctors and view your
              appointment history.
            </p>
          </div>
        </div>
      </div>

      {/* ── Full-width Calendly widget — no side padding ── */}
      <div className="w-full px-0 pb-12">
        <CalendlyWidget />
      </div>

    </div>
  )
}
