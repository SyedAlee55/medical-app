import { getDashboardStats } from '@/app/ceo/actions'
import Link from 'next/link'
import { Users, Stethoscope, ClipboardList, CalendarDays, Clock, Activity } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return (
    d.toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE,  month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { timeZone: GLOBAL_TIMEZONE,  hour: '2-digit', minute: '2-digit', hour12: false })
  )
}

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center justify-between shadow-sm">
      <div>
        <p className="type-label text-zinc-400">{label}</p>
        <h3 className="text-2xl font-bold text-zinc-900 mt-1">{value ?? '—'}</h3>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
    </div>
  )
}

export default async function CeoDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">CEO Dashboard</h1>
        <p className="type-body text-zinc-500 text-sm mt-0.5">Executive overview of platform health and activity</p>
      </div>

      {/* Pending approvals alert */}
      {stats.pendingApprovals > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-amber-800">
            {stats.pendingApprovals} doctor application{stats.pendingApprovals !== 1 ? 's' : ''} awaiting review.
          </p>
          <Link
            href="/ceo/approvals"
            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0"
          >
            View applications →
          </Link>
        </div>
      )}

      {/* Stat grid */}
      <div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <StatCard label="Total Doctors"        value={stats.totalDoctors}        icon={Stethoscope}  colorClass="bg-brand-50 text-brand-600" />
          <StatCard label="Total Patients"       value={stats.totalPatients}       icon={Users}        colorClass="bg-blue-50 text-blue-600" />
          <StatCard label="Pending Approvals"    value={stats.pendingApprovals}    icon={ClipboardList} colorClass="bg-amber-50 text-amber-600" />
          <StatCard label="Total Appointments"   value={stats.totalAppointments}   icon={CalendarDays} colorClass="bg-emerald-50 text-emerald-600" />
          <StatCard label="Pending Appointments" value={stats.pendingAppointments} icon={Clock}        colorClass="bg-orange-50 text-orange-600" />
        </div>
      </div>

      {/* Recent activity table */}
      <div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Recent Activity</h2>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor Role</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {stats.recentLogs?.map((log, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition">
                    <td className="px-6 py-3.5 text-xs text-zinc-500 font-medium">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-3.5 capitalize text-xs font-semibold text-zinc-700">{log.actor_role}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-zinc-500">{log.action}</td>
                  </tr>
                ))}
                {!stats.recentLogs?.length && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 italic">No recent activity.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
