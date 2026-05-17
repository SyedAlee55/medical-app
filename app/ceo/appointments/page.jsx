import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentsFilter from './filter'
import { OverrideAction } from './client-actions'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + 
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default async function AppointmentsPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  const statusFilter = params.status || null
  const fromDate = params.from || null
  const toDate = params.to || null

  let query = supabase
    .from('appointments')
    .select(`
      id, scheduled_at, status, created_at, overridden_by,
      patient:patient_id(full_name),
      doctor:doctor_id(full_name),
      specialty:specialty_id(name)
    `)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)
  if (fromDate) query = query.gte('scheduled_at', new Date(fromDate).toISOString())
  if (toDate) {
    const end = new Date(toDate)
    end.setHours(23, 59, 59, 999)
    query = query.lte('scheduled_at', end.toISOString())
  }

  const { data: appointments } = await query

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Appointments Directory</h1>
      
      <AppointmentsFilter />

      <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Patient</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Doctor</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Specialty</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Scheduled At</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Status</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Created At</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {appointments?.map(a => (
              <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-medium">{a.patient?.full_name || '-'}</td>
                <td className="px-4 py-3">{a.doctor?.full_name || '-'}</td>
                <td className="px-4 py-3">{a.specialty?.name || '-'}</td>
                <td className="px-4 py-3">{formatDate(a.scheduled_at)}</td>
                <td className="px-4 py-3">
                  <span className="capitalize">{a.status}</span>
                  {a.overridden_by && <span className="block text-[10px] text-orange-600 mt-0.5 tracking-wide">Overridden by CEO</span>}
                </td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(a.created_at)}</td>
                <td className="px-4 py-3">
                  <OverrideAction appointmentId={a.id} currentStatus={a.status} />
                </td>
              </tr>
            ))}
            {!appointments?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
