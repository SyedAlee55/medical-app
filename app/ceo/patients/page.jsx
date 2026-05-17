import { getAllUsers } from '@/app/ceo/actions'
import PatientsFilter from './filter'
import { PatientActionButtons } from './client-actions'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function PatientsPage({ searchParams }) {
  const params = await searchParams
  
  const statusFilter = params.status || null
  const includeDeleted = params.includeDeleted === 'true'

  const filters = { role: 'patient', status: statusFilter, includeDeleted }

  const { data: users, error } = await getAllUsers(filters)
  
  const displayUsers = users || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Patients Directory</h1>
      
      <PatientsFilter />

      <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Name</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Email</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Status</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Registered</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Last Login</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayUsers.map(u => (
              <tr key={u.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${u.deleted_at ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium">
                  {u.full_name || 'Unnamed'}
                </td>
                <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.status}</td>
                <td className="px-4 py-3">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">{formatDate(u.last_login_at)}</td>
                <td className="px-4 py-3">
                  <PatientActionButtons userId={u.id} />
                </td>
              </tr>
            ))}
            {displayUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
