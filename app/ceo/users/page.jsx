import { getAllUsers } from '@/app/ceo/actions'
import UsersFilter from './filter'
import { ActionButtons } from './client-actions'

export const dynamic = 'force-dynamic'

export default async function UsersPage({ searchParams }) {
  const params = await searchParams
  
  // By default, do not fetch patients here
  const roleFilter = params.role || null
  const statusFilter = params.status || null
  const includeDeleted = params.includeDeleted === 'true'

  // getAllUsers fetches all if no role provided, but we only want doctors and staff here unless overridden by the getAllUsers which fetches everything.
  // Actually, wait, let's filter the array or pass role filter.
  // We'll pass the filters to getAllUsers. If role is empty, we must filter out patients.
  const filters = { status: statusFilter, includeDeleted }
  if (roleFilter) {
    filters.role = roleFilter
  }

  const { data: users, error } = await getAllUsers(filters)
  
  // Filter out patients if no specific role was requested
  const displayUsers = users?.filter(u => roleFilter ? true : (u.role === 'doctor' || u.role === 'staff')) || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users Directory</h1>
      
      <UsersFilter />

      <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Name</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Role</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Status</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Dept/Specialty</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayUsers.map(u => {
              const isKilled = !!u.kill_switched_at
              return (
                <tr key={u.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${u.deleted_at ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className={`font-medium ${isKilled ? 'line-through text-zinc-400' : ''}`}>
                      {u.full_name || 'Unnamed'}
                    </div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                    {isKilled && <span className="inline-block mt-1 bg-red-100 text-red-800 text-[10px] px-1.5 rounded">Kill Switched</span>}
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 capitalize">{u.status}</td>
                  <td className="px-4 py-3">
                    {u.department || u.specialties?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons userId={u.id} />
                  </td>
                </tr>
              )
            })}
            {displayUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
