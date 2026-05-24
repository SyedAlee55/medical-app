import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Stethoscope, Briefcase, Calendar } from 'lucide-react'

// Force dynamic so it re-fetches stats on every reload
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Defense in depth: Verify Auth & Role again
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

  // 2. Fetch Summary Statistics concurrently
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [
    { count: patientsCount },
    { count: doctorsCount },
    { count: staffCount },
    { count: appointmentsTodayCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
    supabase.from('appointments').select('*', { count: 'exact', head: true })
      .gte('scheduled_at', todayStart.toISOString())
      .lte('scheduled_at', todayEnd.toISOString())
      .is('deleted_at', null)
  ])

  // 3. Fetch Recent Activity (10 newest profiles)
  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  const ROLE_CLASSES = {
    admin: 'bg-red-50 text-red-700 border border-red-100',
    ceo: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    doctor: 'bg-brand-50 text-brand-700 border border-brand-100',
    staff: 'bg-blue-50 text-blue-700 border border-blue-100',
    patient: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Admin Dashboard</h1>
        <p className="type-body text-zinc-500 text-sm mt-0.5">Platform metrics and registration logs</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Patients Card */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Total Patients</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{patientsCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Doctors Card */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Total Doctors</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{doctorsCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Staff Card */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Total Staff</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{staffCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Appointments Today</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{appointmentsTodayCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recent Activity Table Card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-sm">Recent Activity (Newest Users)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700 text-sm">
              {recentProfiles?.map((profile) => {
                const roleClass = ROLE_CLASSES[profile.role] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                return (
                  <tr key={profile.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {profile.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400 font-medium">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                )
              })}
              {!recentProfiles?.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 italic">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
