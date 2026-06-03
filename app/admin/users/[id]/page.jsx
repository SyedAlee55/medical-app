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
  active:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  suspended: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  rejected:  'bg-red-500/10 text-red-400 border border-red-500/20',
}

const ROLE_CLASSES = {
  patient: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  doctor:  'bg-brand-500/10 text-brand-400 border border-brand-500/20',
  staff:   'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  admin:   'bg-red-500/10 text-red-400 border border-red-500/20',
  ceo:     'bg-violet-500/10 text-violet-400 border border-violet-500/20',
}

const APT_STATUS_CLASSES = {
  completed: 'bg-zinc-500/10 text-zinc-400 border border-zinc-800',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  rejected:  'bg-red-500/10 text-red-400 border border-red-500/20',
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
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
        </Link>
        <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-dashed border-zinc-800">
          <UserCircle2 className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-zinc-100">User Not Found</h2>
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

  // blockingAppointmentsCount removed — admin force-delete now handles active appointments

  const statusClass = STATUS_CLASSES[profile.status] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-800'
  const roleClass   = ROLE_CLASSES[profile.role]   || 'bg-zinc-500/10 text-zinc-400 border border-zinc-800'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <span className="text-zinc-800">/</span>
        <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
            {/* Avatar header block */}
            <div className="p-6 flex items-start justify-between gap-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-brand-500/10 text-brand-400 text-xl font-bold flex items-center justify-center shadow-inner border border-brand-500/20 shrink-0">
                  {getInitials(profile.full_name)}
                </div>
                <div>
                  <h2 className="font-bold text-zinc-100 text-lg leading-tight">{profile.full_name || 'Unnamed'}</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">{profile.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>{profile.role}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusClass}`}>{profile.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <dl className="p-6 space-y-4 text-sm">
              <div>
                <dt className="type-label text-zinc-400">Member Since</dt>
                <dd className="text-zinc-100 font-semibold mt-0.5">{new Date(profile.created_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE,  month: 'short', day: 'numeric', year: 'numeric' })}</dd>
              </div>
              <div>
                <dt className="type-label text-zinc-400">Last Login</dt>
                <dd className="text-zinc-100 font-semibold mt-0.5">{profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE }) : 'Never'}</dd>
              </div>
              {profile.phone && (
                <div>
                  <dt className="type-label text-zinc-400">Phone</dt>
                  <dd className="text-zinc-100 font-semibold mt-0.5">{profile.phone}</dd>
                </div>
              )}
              {profile.date_of_birth && (
                <div>
                  <dt className="type-label text-zinc-400">Date of Birth</dt>
                  <dd className="text-zinc-100 font-semibold mt-0.5">{profile.date_of_birth}</dd>
                </div>
              )}
              {profile.gender && (
                <div>
                  <dt className="type-label text-zinc-400">Gender</dt>
                  <dd className="text-zinc-100 font-semibold mt-0.5 capitalize">{profile.gender.replace(/_/g, ' ')}</dd>
                </div>
              )}

              {['doctor', 'staff'].includes(profile.role) && (
                <>
                  <div className="border-t border-zinc-800 pt-4">
                    <dt className="type-label text-zinc-400">Employee ID</dt>
                    <dd className="text-zinc-100 font-semibold mt-0.5">{profile.employee_id || 'Not assigned'}</dd>
                  </div>
                  <div>
                    <dt className="type-label text-zinc-400">Department</dt>
                    <dd className="text-zinc-100 font-semibold mt-0.5">{profile.department || 'Not assigned'}</dd>
                  </div>
                  {profile.specialties?.name && (
                    <div>
                      <dt className="type-label text-zinc-400">Specialty</dt>
                      <dd className="text-zinc-100 font-semibold mt-0.5">{profile.specialties.name}</dd>
                    </div>
                  )}
                  {profile.bio && (
                    <div className="border-t border-zinc-800 pt-4">
                      <dt className="type-label text-zinc-400">Bio</dt>
                      <dd className="text-zinc-300 text-xs leading-relaxed mt-1 whitespace-pre-wrap">{profile.bio}</dd>
                    </div>
                  )}
                </>
              )}

              {profile.role === 'patient' && (
                <>
                  {profile.allergies && (
                    <div className="border-t border-zinc-800 pt-4">
                      <dt className="type-label text-zinc-400">Allergies</dt>
                      <dd className="text-zinc-100 font-semibold mt-0.5">{profile.allergies}</dd>
                    </div>
                  )}
                  {profile.medical_history && (
                    <div className={profile.allergies ? '' : 'border-t border-zinc-800 pt-4'}>
                      <dt className="type-label text-zinc-400">Medical History</dt>
                      <dd className="text-zinc-300 text-xs leading-relaxed mt-1 whitespace-pre-wrap">{profile.medical_history}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>

            {/* Actions */}
            {profile.role !== 'ceo' && (
              <div className="px-6 pb-6 flex flex-wrap gap-2">
                {profile.status === 'suspended' ? (
                  <form action={reactivateUser} className="flex-1 min-w-[80px]">
                    <input type="hidden" name="userId" value={profile.id} />
                    <button type="submit" className="w-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-semibold rounded-lg px-3 py-2 text-[11px] sm:text-xs transition cursor-pointer">
                      Reactivate
                    </button>
                  </form>
                ) : (
                  <form action={suspendUser} className="flex-1 min-w-[80px]">
                    <input type="hidden" name="userId" value={profile.id} />
                    <button type="submit" className="w-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-semibold rounded-lg px-3 py-2 text-[11px] sm:text-xs transition cursor-pointer">
                      Suspend
                    </button>
                  </form>
                )}

                <Link
                  href={`/admin/users/${profile.id}/edit`}
                  className="flex-1 min-w-[80px] border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold rounded-lg px-3 py-2 text-[11px] sm:text-xs transition cursor-pointer text-center flex items-center justify-center"
                >
                  Edit
                </Link>

                <DeleteUserDialog
                  userId={profile.id}
                  trigger={
                    <button
                      type="button"
                      className="flex-1 min-w-[80px] border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold rounded-lg px-3 py-2 text-[11px] sm:text-xs transition cursor-pointer"
                    >
                      Delete
                    </button>
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Appointments Table */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-zinc-800">
              <h3 className="font-semibold text-zinc-100 text-sm">Appointment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                    <th className="px-6 py-3">Date &amp; Time</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {appointments?.length > 0 ? (
                    appointments.map(apt => {
                      const aptClass = APT_STATUS_CLASSES[apt.status] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-800'
                      return (
                        <tr key={apt.id} className="hover:bg-zinc-800/20 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-zinc-300">
                            {new Date(apt.scheduled_at).toLocaleString([], { timeZone: GLOBAL_TIMEZONE,  dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${aptClass}`}>{apt.status}</span>
                          </td>
                          <td className="px-6 py-4 max-w-[180px] truncate text-xs text-zinc-400" title={apt.reason_for_visit}>
                            {apt.reason_for_visit || '—'}
                          </td>
                          <td className="px-6 py-4 max-w-[180px] truncate text-xs text-zinc-500" title={apt.notes}>
                            {apt.notes || '—'}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic text-sm">
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
