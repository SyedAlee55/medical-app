import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + 
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default async function PatientProfilePage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile || profile.role !== 'patient') redirect('/ceo/patients')

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, status, reason_for_visit, created_at, overridden_by,
      doctor:doctor_id(full_name),
      specialty:specialty_id(name)
    `)
    .eq('patient_id', id)
    .order('scheduled_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/ceo/patients" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">← Back to patients</Link>
        <h1 className="text-2xl font-bold">Patient Profile: {profile.full_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-700 pb-2">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Full Name</span>
              <span className="font-medium">{profile.full_name}</span>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Phone</span>
              <span className="font-medium">{profile.phone || '-'}</span>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Date of Birth</span>
              <span className="font-medium">{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '-'}</span>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Gender</span>
              <span className="font-medium capitalize">{profile.gender || '-'}</span>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Status</span>
              <span className="font-medium capitalize">{profile.status}</span>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Registered</span>
              <span className="font-medium">{formatDate(profile.created_at)}</span>
            </div>
            <div>
              <span className="block text-zinc-500 text-xs uppercase tracking-wide">Last Login</span>
              <span className="font-medium">{formatDate(profile.last_login_at)}</span>
            </div>
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-700 pb-2">Internal Notes</h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {profile.notes || <span className="text-zinc-400 italic">No notes added.</span>}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Appointment History</h2>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Scheduled At</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Doctor</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Specialty</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Status</th>
                <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {appointments?.map(a => (
                <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{formatDate(a.scheduled_at)}</td>
                  <td className="px-4 py-3">{a.doctor?.full_name || '-'}</td>
                  <td className="px-4 py-3">{a.specialty?.name || '-'}</td>
                  <td className="px-4 py-3 capitalize">
                    {a.status}
                    {a.overridden_by && <span className="block text-[10px] text-orange-600 mt-0.5 uppercase tracking-wide">Overridden</span>}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={a.reason_for_visit}>
                    {a.reason_for_visit || '-'}
                  </td>
                </tr>
              ))}
              {!appointments?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
