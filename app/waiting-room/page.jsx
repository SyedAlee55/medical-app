import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { Clock } from 'lucide-react'

export default async function WaitingRoomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-10 w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <Clock className="w-8 h-8" />
        </div>

        {/* Copy */}
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-3">
          Account Pending
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
          Your account is pending approval. You&apos;ll receive an email once an administrator reviews your application.
        </p>

        {/* Divider */}
        <div className="border-t border-zinc-100 my-8" />

        {/* Sign out */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl py-3 text-sm transition duration-200 cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
