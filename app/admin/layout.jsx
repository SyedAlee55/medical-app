import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import NavLinks from './nav-links'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'ceo')) {
    redirect('/403')
  }

  // Fetch pending applications count for the sidebar badge
  const { count: pendingCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .in('role', ['doctor', 'staff'])

  // Fetch today's pending appointments for the sidebar badge
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  const todayEnd = new Date()
  todayEnd.setHours(23,59,59,999)

  const { count: pendingApptsCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .gte('scheduled_at', todayStart.toISOString())
    .lte('scheduled_at', todayEnd.toISOString())

  // Fetch pending emergency requests count for the sidebar badge
  const { count: pendingEmergenciesCount } = await supabase
    .from('appointments')
    .select('*, profiles!appointments_doctor_id_fkey!inner(department)', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('profiles.department', 'Emergency')
    .is('deleted_at', null)

  const initials = (profile.full_name || 'A')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden">

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white border-r border-zinc-100 flex flex-col hidden md:flex">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-zinc-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white">
            <svg width="11" height="11" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2h4v10h10v4h-10v10h-4v-10H2v-4h10V2z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-zinc-950 text-sm leading-tight tracking-tight">Tj&apos;s Medical Hub</p>
            <p className="text-[10px] text-zinc-400 font-medium">Admin Portal</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks
            pendingCount={pendingCount || 0}
            pendingApptsCount={pendingApptsCount || 0}
            pendingEmergenciesCount={pendingEmergenciesCount || 0}
          />
        </nav>

        {/* Sidebar footer — user identity + logout */}
        <div className="px-4 py-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl px-3 py-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-800 truncate">{profile.full_name || 'Administrator'}</p>
              <span className="bg-brand-50 text-brand-700 border border-brand-100 font-bold px-1.5 py-0.5 rounded-full text-[9px]">
                ADMIN
              </span>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="w-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-semibold rounded-lg px-3 py-1.5 text-xs transition cursor-pointer text-left"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 border-b border-zinc-100 bg-white flex items-center px-4 gap-3 shrink-0">
          <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white">
            <svg width="9" height="9" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2h4v10h10v4h-10v10h-4v-10H2v-4h10V2z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-zinc-950 text-sm">Admin Portal</span>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-zinc-50">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}
