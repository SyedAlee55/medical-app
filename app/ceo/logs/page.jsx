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

  const fromDate = params.from || null
  const toDate = params.to || null
  const actionFilter = params.action || null
  const roleFilter = params.role || null
  const page = parseInt(params.page || '1', 10)
  const pageSize = 50
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (fromDate) query = query.gte('created_at', new Date(fromDate).toISOString())
  if (toDate) {
    const end = new Date(toDate)
    end.setHours(23, 59, 59, 999)
    query = query.lte('created_at', end.toISOString())
  }
  if (actionFilter) query = query.ilike('action', `%${actionFilter}%`)
  if (roleFilter) query = query.eq('actor_role', roleFilter)

  const { data: logs, count } = await query
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>
        <ExportLogs />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Live Log Feed</h2>
        <LogsFilter />

        <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Timestamp</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Actor Role</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Action</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Target Type</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {logs?.map(log => (
                <ExpandableRow key={log.id} log={log} />
              ))}
              {!logs?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No logs found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-zinc-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${new URLSearchParams({ ...params, page: page - 1 }).toString()}`} className="border px-3 py-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?${new URLSearchParams({ ...params, page: page + 1 }).toString()}`} className="border px-3 py-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
