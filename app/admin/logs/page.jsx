import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogsFilter from './filter'
import { ExpandableRow } from './expandable-row'
import ExportLogs from './ExportLogs'

export const dynamic = 'force-dynamic'

export default async function ActivityLogsPage({ searchParams }) {
  const params = await searchParams
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

  const fromDate     = params.from   || null
  const toDate       = params.to     || null
  const actionFilter = params.action || null
  const roleFilter   = params.role   || null
  const page         = parseInt(params.page || '1', 10)
  const pageSize     = 50
  const offset       = (page - 1) * pageSize

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (fromDate)     query = query.gte('created_at', new Date(fromDate).toISOString())
  if (toDate)       { const end = new Date(toDate); end.setHours(23,59,59,999); query = query.lte('created_at', end.toISOString()) }
  if (actionFilter) query = query.ilike('action', `%${actionFilter}%`)
  if (roleFilter)   query = query.eq('actor_role', roleFilter)

  const { data: logs, count } = await query
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Activity Logs</h1>
        <p className="type-body text-zinc-400 text-sm mt-0.5">Full audit trail of platform actions</p>
      </div>

      <ExportLogs />

      {/* Filters */}
      <LogsFilter />

      {/* Log Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Actor Role</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target Type</th>
                <th className="px-6 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300 text-sm">
              {logs?.map(log => (
                <ExpandableRow key={log.id} log={log} />
              ))}
              {!logs?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                    No logs found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?${new URLSearchParams({ ...params, page: (page - 1).toString() }).toString()}`}
                className="border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold rounded-lg px-3.5 py-1.5 text-xs transition cursor-pointer"
              >
                ← Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`?${new URLSearchParams({ ...params, page: (page + 1).toString() }).toString()}`}
                className="border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold rounded-lg px-3.5 py-1.5 text-xs transition cursor-pointer"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
