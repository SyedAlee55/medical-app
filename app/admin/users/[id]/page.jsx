import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCircle2 } from 'lucide-react'
import { suspendUser, reactivateUser } from '@/app/admin/actions'
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog'
import { GLOBAL_TIMEZONE } from '@/utils/time'

export const dynamic = 'force-dynamic'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

const STATUS_CLASSES = {
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-100',
  pending:   'bg-amber-50 text-amber-700 border border-amber-100',
  suspended: 'bg-orange-50 text-orange-700 border border-orange-100',
  rejected:  'bg-red-50 text-red-700 border border-red-100',
}

const ROLE_CLASSES = {
  patient: 'bg-blue-50 text-blue-700 border border-blue-100',
  doctor:  'bg-brand-50 text-brand-700 border border-brand-100',
  staff:   'bg-indigo-50 text-indigo-700 border border-indigo-100',
  admin:   'bg-red-50 text-red-700 border border-red-100',
  ceo:     'bg-violet-50 text-violet-700 border border-violet-100',
}

const APT_STATUS_CLASSES = {
  completed: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  pending:   'bg-amber-50 text-amber-700 border border-amber-100',
  cancelled: 'bg-red-50 text-red-700 border border-red-100',
  rejected:  'bg-red-50 text-red-700 border border-red-100',
}

export default async function UserProfilePage({ params }) {
  const supabase = await createClient()
  const { id } = await params

  // Verify Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ceo')) {
    redirect('/403')
  }

  // Fetch Target Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(`*, specialties(name)`)
    .eq('id', id)
    .single()

  if (!profile) {
    return (
      <div className="space-y-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
        </Link>
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
          <UserCircle2 className="w-14 h-14 text-zinc-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-zinc-900">User Not Found</h2>
          <p className="text-sm text-zinc-400 mt-1">The requested profile does not exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  // Fetch Appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, status, reason_for_visit, notes')
    .or(`patient_id.eq.${id},doctor_id.eq.${id}`)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  const { count: blockingAppointmentsCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .or(`patient_id.eq.${id},doctor_id.eq.${id}`)
    .in('status', ['pending', 'confirmed'])

  const statusClass = STATUS_CLASSES[profile.status] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
  const roleClass   = ROLE_CLASSES[profile.role]   || 'bg-zinc-50 text-zinc-600 border border-zinc-200'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <span className="text-zinc-300">/</span>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            {/* Avatar header block */}
            <div className="p-6 flex items-start justify-between gap-4 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 text-xl font-bold flex items-center justify-center shadow-inner border border-brand-100 shrink-0">
                  {getInitials(profile.full_name)}
                </div>
                <div>
                  <h2 className="font-bold text-zinc-900 text-lg leading-tight">{profile.full_name || 'Unnamed'}</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">{profile.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>{profile.role}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusClass}`}>{profile.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blocking warning */}
            {profile.role !== 'ceo' && blockingAppointmentsCount > 0 && (
              <div className="mx-6 mt-5 p-4 border border-amber-200 bg-amber-50 rounded-xl">
                <h4 className="text-amber-800 font-semibold text-xs mb-1">Cannot Delete User</h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  This user has <strong>{blockingAppointmentsCount}</strong> active or pending appointments. Resolve all appointments before deleting this account.
                </p>
              </div>
            )}

            {/* Profile Details */}
            <dl className="p-6 space-y-4 text-sm">
              <div>
                <dt className="type-label text-zinc-400">Member Since</dt>
                <dd className="text-zinc-900 font-semibold mt-0.5">{new Date(profile.created_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE,  month: 'short', day: 'numeric', year: 'numeric' })}</dd>
              </div>
              <div>
                <dt className="type-label text-zinc-400">Last Login</dt>
                <dd className="text-zinc-900 font-semibold mt-0.5">{profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE }) : 'Never'}</dd>
              </div>
              {profile.phone && (
                <div>
                  <dt className="type-label text-zinc-400">Phone</dt>
                  <dd className="text-zinc-900 font-semibold mt-0.5">{profile.phone}</dd>
                </div>
              )}
              {profile.date_of_birth && (
                <div>
                  <dt className="type-label text-zinc-400">Date of Birth</dt>
                  <dd className="text-zinc-900 font-semibold mt-0.5">{profile.date_of_birth}</dd>
                </div>
              )}

              {['doctor', 'staff'].includes(profile.role) && (
                <>
                  <div className="border-t border-zinc-100 pt-4">
                    <dt className="type-label text-zinc-400">Department</dt>
                    <dd className="text-zinc-900 font-semibold mt-0.5">{profile.department || 'Not assigned'}</dd>
                  </div>
                  {profile.specialties?.name && (
                    <div>
                      <dt className="type-label text-zinc-400">Specialty</dt>
                      <dd className="text-zinc-900 font-semibold mt-0.5">{profile.specialties.name}</dd>
                    </div>
                  )}
                </>
              )}

              {profile.bio && (
                <div className="border-t border-zinc-100 pt-4">
                  <dt className="type-label text-zinc-400">Bio</dt>
                  <dd className="text-zinc-700 text-xs leading-relaxed mt-1 whitespace-pre-wrap">{profile.bio}</dd>
                </div>
              )}
            </dl>

            {/* Actions */}
            {profile.role !== 'ceo' && (
              <div className="px-6 pb-6 flex gap-2">
                {profile.status === 'suspended' ? (
                  <form action={reactivateUser} className="flex-1">
                    <input type="hidden" name="userId" value={profile.id} />
                    <button type="submit" className="w-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-lg px-3 py-2 text-xs transition cursor-pointer">
                      Reactivate
                    </button>
                  </form>
                ) : (
                  <form action={suspendUser} className="flex-1">
                    <input type="hidden" name="userId" value={profile.id} />
                    <button type="submit" className="w-full border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg px-3 py-2 text-xs transition cursor-pointer">
                      Suspend
                    </button>
                  </form>
                )}

                {!blockingAppointmentsCount && (
                  <DeleteUserDialog
                    userId={profile.id}
                    trigger={
                      <button
                        type="button"
                        className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg px-3 py-2 text-xs transition cursor-pointer"
                      >
                        Delete
                      </button>
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Appointments Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm">Appointment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                    <th className="px-6 py-3">Date &amp; Time</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {appointments?.length > 0 ? (
                    appointments.map(apt => {
                      const aptClass = APT_STATUS_CLASSES[apt.status] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                      return (
                        <tr key={apt.id} className="hover:bg-zinc-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-zinc-700">
                            {new Date(apt.scheduled_at).toLocaleString([], { timeZone: GLOBAL_TIMEZONE,  dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${aptClass}`}>{apt.status}</span>
                          </td>
                          <td className="px-6 py-4 max-w-[180px] truncate text-xs text-zinc-500" title={apt.reason_for_visit}>
                            {apt.reason_for_visit || '—'}
                          </td>
                          <td className="px-6 py-4 max-w-[180px] truncate text-xs text-zinc-400" title={apt.notes}>
                            {apt.notes || '—'}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic text-sm">
                        No appointments found for this user.
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
