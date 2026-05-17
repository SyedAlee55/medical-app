import { getDashboardStats } from '@/app/ceo/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + 
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default async function CeoDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      {stats.pendingApprovals > 0 && (
        <div className="text-sm font-medium">
          {stats.pendingApprovals} doctor applications awaiting review.{' '}
          <Link href="/ceo/approvals" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
            View applications
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Doctors" value={stats.totalDoctors} />
          <StatCard label="Total Patients" value={stats.totalPatients} />
          <StatCard label="Pending Approvals" value={stats.pendingApprovals} />
          <StatCard label="Total Appointments" value={stats.totalAppointments} />
          <StatCard label="Pending Appointments" value={stats.pendingAppointments} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Timestamp</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Actor Role</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {stats.recentLogs?.map((log, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3 capitalize">{log.actor_role}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                </tr>
              ))}
              {!stats.recentLogs?.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">No recent activity.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded p-4 flex flex-col items-center justify-center text-center">
      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{value ?? '-'}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}
