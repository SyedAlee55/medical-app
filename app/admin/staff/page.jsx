import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { suspendUser, reactivateUser } from '@/app/admin/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

export default async function AdminStaffPage() {
  const supabase = await createClient()

  // Verify Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'ceo')) {
    redirect('/403')
  }

  // Fetch Staff & Doctors
  const { data: staffProfiles } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, role, department, status, created_at,
      specialties(name)
    `)
    .in('role', ['doctor', 'staff'])
    .in('status', ['active', 'suspended'])
    .order('full_name', { ascending: true })

  const totalDoctors = staffProfiles?.filter(p => p.role === 'doctor').length || 0
  const totalStaff = staffProfiles?.filter(p => p.role === 'staff').length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctors & Staff Directory</h1>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-sm font-medium text-purple-900">{totalDoctors} Doctors</span>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-sm font-medium text-indigo-900">{totalStaff} Staff</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staffProfiles?.length > 0 ? (
          staffProfiles.map(p => (
            <Card key={p.id} className={`overflow-hidden relative ${p.status === 'suspended' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
              {p.status === 'suspended' && (
                <div className="absolute top-0 left-0 right-0 bg-orange-100 text-orange-800 text-xs font-bold text-center py-1 border-b border-orange-200">
                  SUSPENDED
                </div>
              )}
              <CardContent className={`p-6 ${p.status === 'suspended' ? 'pt-8' : ''}`}>
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0
                    bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 shadow-sm"
                  >
                    {getInitials(p.full_name)}
                  </div>
                  
                  <div className="space-y-1 overflow-hidden">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate" title={p.full_name}>
                      {p.full_name || 'Unnamed User'}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate" title={p.email}>{p.email}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="secondary" className="capitalize">
                        {p.role}
                      </Badge>
                      {p.status === 'active' ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                          {p.status}
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
                          {p.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-md mb-4 border border-zinc-100 dark:border-zinc-800">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-zinc-500">Department:</div>
                    <div className="font-medium text-slate-700 dark:text-zinc-300 text-right truncate">
                      {p.department || p.specialties?.name || 'N/A'}
                    </div>
                    <div className="text-zinc-500">Joined:</div>
                    <div className="font-medium text-slate-700 dark:text-zinc-300 text-right">
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/admin/users/${p.id}`}>View Profile</Link>
                  </Button>
                  
                  {p.role !== 'ceo' && (
                    <div className="flex-1">
                      {p.status === 'suspended' ? (
                        <form action={reactivateUser}>
                          <input type="hidden" name="userId" value={p.id} />
                          <Button variant="outline" type="submit" className="w-full text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200">
                            Reactivate
                          </Button>
                        </form>
                      ) : (
                        <form action={suspendUser}>
                          <input type="hidden" name="userId" value={p.id} />
                          <Button variant="outline" type="submit" className="w-full text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-orange-200">
                            Suspend
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-lg border border-dashed">
            No active doctors or staff found.
          </div>
        )}
      </div>
    </div>
  )
}
