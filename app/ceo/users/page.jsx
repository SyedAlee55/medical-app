import { getAllUsers } from '@/app/ceo/actions'
import UsersFilter from './filter'
import { ActionButtons } from './client-actions'

export const dynamic = 'force-dynamic'

const ROLE_CLASSES = {
  doctor: 'bg-brand-50 text-brand-700 border border-brand-100',
  staff:  'bg-indigo-50 text-indigo-700 border border-indigo-100',
  admin:  'bg-red-50 text-red-700 border border-red-100',
}
const STATUS_CLASSES = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-100',
  pending:   'bg-amber-50 text-amber-700 border border-amber-100',
  suspended: 'bg-orange-50 text-orange-700 border border-orange-100',
  rejected:  'bg-red-50 text-red-700 border border-red-100',
}

export default async function UsersPage({ searchParams }) {
  const params = await searchParams

  const roleFilter     = params.role          || null
  const statusFilter   = params.status        || null
  const includeDeleted = params.includeDeleted === 'true'

  const filters = { status: statusFilter, includeDeleted }
  if (roleFilter) filters.role = roleFilter

  const { data: users } = await getAllUsers(filters)

  // Default: show only doctors and staff
  const displayUsers = users?.filter(u =>
    roleFilter ? true : (u.role === 'doctor' || u.role === 'staff')
  ) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Users Directory</h1>
        <p className="type-body text-zinc-500 text-sm mt-0.5">Doctors, staff, and administrators in the system</p>
      </div>

      <UsersFilter />

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Dept / Specialty</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {displayUsers.map(u => {
                const isKilled   = !!u.kill_switched_at
                const roleClass  = ROLE_CLASSES[u.role]   || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                const statClass  = STATUS_CLASSES[u.status] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                return (
                  <tr key={u.id} className={`hover:bg-zinc-50/50 transition ${u.deleted_at ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className={`font-semibold text-zinc-900 ${isKilled ? 'line-through text-zinc-400' : ''}`}>
                        {u.full_name || 'Unnamed'}
                      </div>
                      <div className="text-xs text-zinc-400 font-medium mt-0.5">{u.email}</div>
                      {isKilled && (
                        <span className="inline-block mt-1 bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          Kill Switched
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statClass}`}>{u.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                      {u.department || u.specialties?.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <ActionButtons userId={u.id} />
                    </td>
                  </tr>
                )
              })}
              {displayUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
