import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Stethoscope, Briefcase, Calendar, ScrollText, ChevronRight } from 'lucide-react'
import RealTimeClock from '@/components/real-time-clock'
import { GLOBAL_TIMEZONE } from '@/utils/time'

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
    { count: appointmentsTodayCount },
    { count: pendingApprovalsCount },
    { data: recentProfiles },
    { data: recentLogs }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
    supabase.from('appointments').select('*', { count: 'exact', head: true })
      .gte('scheduled_at', todayStart.toISOString())
      .lte('scheduled_at', todayEnd.toISOString())
      .is('deleted_at', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending').in('role', ['doctor', 'staff']),
    supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('audit_logs').select('created_at, actor_role, action').order('created_at', { ascending: false }).limit(6)
  ])

  const ROLE_CLASSES = {
    admin: 'bg-red-500/10 text-red-400 border border-red-500/20',
    ceo: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    doctor: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
    staff: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    patient: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Admin Overview</h1>
          <p className="type-body text-zinc-400 text-sm mt-0.5 font-medium">Platform metrics and executive audit logs</p>
        </div>
        <RealTimeClock />
      </div>

      {/* Pending approvals alert */}
      {pendingApprovalsCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 animate-fade-in">
          <p className="text-xs sm:text-sm font-semibold text-amber-400">
            {pendingApprovalsCount} doctor/staff application{pendingApprovalsCount !== 1 ? 's' : ''} awaiting review.
          </p>
          <Link
            href="/admin/approvals"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0 flex items-center gap-1"
          >
            Review applications <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Patients Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Total Patients</p>
            <h3 className="text-2xl font-bold text-zinc-100 mt-1">{patientsCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Doctors Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Total Doctors</p>
            <h3 className="text-2xl font-bold text-zinc-100 mt-1">{doctorsCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Staff Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Total Staff</p>
            <h3 className="text-2xl font-bold text-zinc-100 mt-1">{staffCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="type-label text-zinc-400">Appointments Today</p>
            <h3 className="text-2xl font-bold text-zinc-100 mt-1">{appointmentsTodayCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Activity Table Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-100 text-sm">New Registered Users</h3>
              <Link href="/admin/users" className="text-xs font-semibold text-brand-400 hover:underline">
                View Directory
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                    <th className="px-6 py-3">Full Name</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300 text-xs">
                  {recentProfiles?.map((p) => {
                    const roleClass = ROLE_CLASSES[p.role] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-800'
                    return (
                      <tr key={p.id} className="hover:bg-zinc-800/20 transition">
                        <td className="px-6 py-3.5 font-semibold text-zinc-100">
                          {p.full_name || 'N/A'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>
                            {p.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-zinc-400">
                          {new Date(p.created_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE, 
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    )
                  })}
                  {!recentProfiles?.length && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs Table Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-100 text-sm">Recent Activity Logs</h3>
              <Link href="/admin/logs" className="text-xs font-semibold text-brand-400 hover:underline">
                View All Logs
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Actor</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300 text-xs">
                  {recentLogs?.map((log, index) => {
                    const roleClass = ROLE_CLASSES[log.actor_role] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-800'
                    return (
                      <tr key={index} className="hover:bg-zinc-800/20 transition">
                        <td className="px-6 py-3.5 text-zinc-400">
                          {new Date(log.created_at).toLocaleTimeString('en-US', { timeZone: GLOBAL_TIMEZONE,
                            hour: '2-digit', minute: '2-digit', hour12: false
                          })}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>
                            {log.actor_role || 'system'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[10px] text-zinc-100">
                          {log.action}
                        </td>
                      </tr>
                    )
                  })}
                  {!recentLogs?.length && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic">
                        No activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
