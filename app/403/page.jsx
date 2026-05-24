import Link from 'next/link'
import { ShieldOff } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-10 w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
          <ShieldOff className="w-8 h-8" />
        </div>

        {/* Copy */}
        <p className="text-sm font-bold text-zinc-300 tracking-widest uppercase mb-3">Error 403</p>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-3">
          Access Denied
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        {/* Divider */}
        <div className="border-t border-zinc-100 my-8" />

        {/* CTA */}
        <Link
          href="/"
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl py-3 text-sm transition duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] inline-block"
        >
          Go to my dashboard
        </Link>
      </div>
    </div>
  )
}
