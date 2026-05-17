import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeIdFilter from './filter'
import { EmployeeIdActions } from './client-actions'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function EmployeeIdsPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  const filter = params.filter || 'all'

  let query = supabase
    .from('profiles')
    .select(`
      id, full_name, role, employee_id, employee_id_verified, employee_id_verified_at
    `)
    .in('role', ['doctor', 'staff'])
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filter === 'verified') query = query.eq('employee_id_verified', true)
  if (filter === 'unverified') query = query.eq('employee_id_verified', false)

  const { data: employees } = await query

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Employee IDs Verification</h1>
      
      <EmployeeIdFilter />

      <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Name</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Role</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Employee ID</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Verified</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Verified At</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {employees?.map(e => (
              <tr key={e.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-medium">{e.full_name || 'Unnamed'}</td>
                <td className="px-4 py-3 capitalize">{e.role}</td>
                <td className={`px-4 py-3 ${!e.employee_id_verified ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                  {e.employee_id || '-'}
                </td>
                <td className="px-4 py-3">
                  {e.employee_id_verified ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-zinc-500">No</span>
                  )}
                </td>
                <td className="px-4 py-3">{formatDate(e.employee_id_verified_at)}</td>
                <td className="px-4 py-3">
                  <EmployeeIdActions targetId={e.id} />
                </td>
              </tr>
            ))}
            {!employees?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
