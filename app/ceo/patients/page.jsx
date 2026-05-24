import { getAllUsers } from '@/app/ceo/actions'
import PatientsFilter from './filter'
import { PatientActionButtons } from './client-actions'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_CLASSES = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-100',
  pending:   'bg-amber-50 text-amber-700 border border-amber-100',
  suspended: 'bg-orange-50 text-orange-700 border border-orange-100',
  rejected:  'bg-red-50 text-red-700 border border-red-100',
}

export default async function PatientsPage({ searchParams }) {
  const params = await searchParams

  const statusFilter   = params.status        || null
  const includeDeleted = params.includeDeleted === 'true'

  const { data: users } = await getAllUsers({ role: 'patient', status: statusFilter, includeDeleted })
  const displayUsers = users || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Patients Directory</h1>
        <p className="type-body text-zinc-500 text-sm mt-0.5">All registered patients across the platform</p>
      </div>

      <PatientsFilter />

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Registered</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {displayUsers.map(u => {
                const statClass = STATUS_CLASSES[u.status] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                return (
                  <tr key={u.id} className={`hover:bg-zinc-50/50 transition ${u.deleted_at ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-zinc-900">{u.full_name || 'Unnamed'}</td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statClass}`}>{u.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-400">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-400">{formatDate(u.last_login_at)}</td>
                    <td className="px-6 py-4">
                      <PatientActionButtons userId={u.id} />
                    </td>
                  </tr>
                )
              })}
              {displayUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
