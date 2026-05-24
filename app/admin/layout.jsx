import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import NavLinks from './nav-links'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-700 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h1 className="font-bold text-lg text-slate-900 dark:text-white">Admin Portal</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks pendingCount={pendingCount || 0} pendingApptsCount={pendingApptsCount || 0} />
        </nav>
        
        {/* Footer with role badge */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
              {profile.full_name || 'Administrator'}
            </span>
            <Badge variant="secondary" className="w-fit">Admin</Badge>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-6">
          <div className="md:hidden font-bold">Admin Portal</div>
          <div className="hidden md:block font-medium">Administration</div>
          <div className="flex items-center gap-4">
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">
                Log out
              </Button>
            </form>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-zinc-50 dark:bg-zinc-900">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
