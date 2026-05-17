import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import NavLinks from './nav-links'
import { Button } from '@/components/ui/button'

export default async function CeoLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/403')
  }

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-700 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h1 className="font-bold text-lg">CEO Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-6">
          <div className="md:hidden font-bold">CEO Portal</div>
          <div className="hidden md:block font-medium">CEO Portal</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{profile.full_name || 'CEO'}</span>
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
