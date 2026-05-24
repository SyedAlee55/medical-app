import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentsFilter from './filter'
import { OverrideAction } from './client-actions'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  )
}

const STATUS_CLASSES = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  completed: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-100',
  rejected:  'bg-red-50 text-red-700 border border-red-100',
  overridden:'bg-brand-50 text-brand-700 border border-brand-100',
}

export default async function AppointmentsPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  const statusFilter = params.status || null
  const fromDate     = params.from   || null
  const toDate       = params.to     || null

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
  if (fromDate)     query = query.gte('scheduled_at', new Date(fromDate).toISOString())
  if (toDate)       { const end = new Date(toDate); end.setHours(23,59,59,999); query = query.lte('scheduled_at', end.toISOString()) }

  const { data: appointments } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Appointments Directory</h1>
        <p className="type-body text-zinc-500 text-sm mt-0.5">Full appointment ledger with CEO override controls</p>
      </div>

      {/* Banners */}
      {params?.error === 'reschedule_conflict' && (
        <div className="p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Conflict detected: The doctor already has an appointment at the requested time.</span>
        </div>
      )}
      {params?.error === 'not_found' && (
        <div className="p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Appointment not found.</span>
        </div>
      )}
      {params?.success === 'overridden' && (
        <div className="p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Appointment successfully overridden.</span>
        </div>
      )}

      <AppointmentsFilter />

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Specialty</th>
                <th className="px-6 py-3">Scheduled At</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {appointments?.map(a => {
                const statusClass = STATUS_CLASSES[a.status] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                return (
                  <tr key={a.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{a.patient?.full_name || '—'}</td>
                    <td className="px-6 py-4 text-zinc-700">{a.doctor?.full_name || '—'}</td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">{a.specialty?.name || '—'}</td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">{formatDate(a.scheduled_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize w-fit ${statusClass}`}>{a.status}</span>
                        {a.overridden_by && (
                          <span className="text-[10px] font-semibold text-orange-600">CEO Override</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-400">{formatDate(a.created_at)}</td>
                    <td className="px-6 py-4">
                      <OverrideAction
                        appointmentId={a.id}
                        currentStatus={a.status}
                        currentScheduledAt={a.scheduled_at}
                      />
                    </td>
                  </tr>
                )
              })}
              {!appointments?.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 italic">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
