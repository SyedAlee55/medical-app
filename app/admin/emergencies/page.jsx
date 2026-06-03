import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import EmergenciesList from '@/components/admin/emergencies-list'

export const dynamic = 'force-dynamic'

export default async function AdminEmergenciesPage({ searchParams }) {
  const supabase = await createClient()
  const params = await searchParams

  // Auth & Role guard
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'ceo')) {
    redirect('/403')
  }

  // Fetch all appointments assigned to Emergency-department doctors
  // We join on doctor profile to filter by department
  const { data: emergencyAppts } = await supabase
    .from('appointments')
    .select(`
      id,
      status,
      scheduled_at,
      reason_for_visit,
      notes,
      rejection_reason,
      cancellation_reason,
      created_at,
      doctor:profiles!appointments_doctor_id_fkey (
        id, full_name, department
      ),
      patient:profiles!appointments_patient_id_fkey (
        id, full_name, email, phone
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Filter client-side for Emergency department (Supabase PostgREST doesn't allow
  // filtering on joined columns directly without a view, so we filter here)
  const filteredAppts = (emergencyAppts || []).filter(
    (a) => a.doctor?.department?.toLowerCase() === 'emergency'
  )

  const pendingCount = filteredAppts.filter(a => a.status === 'pending').length

  const errorMessages = {
    invalid_status:   'Invalid status update.',
    not_found:        'Emergency request not found.',
    already_responded: 'This request has already been reviewed.',
    time_conflict:    'A time conflict exists for this appointment slot.',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Emergency Requests
            </h1>
          </div>
          <p className="text-sm text-zinc-500 font-medium ml-11">
            Review and action urgent appointment requests submitted by patients to the Emergency department.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="shrink-0 bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {pendingCount} Awaiting Review
          </div>
        )}
      </div>

      {/* Toast banners */}
      {params?.success === 'updated' && (
        <div className="p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Emergency request has been updated successfully.</span>
        </div>
      )}

      {params?.error && (
        <div className="p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessages[params.error] || 'Something went wrong. Please try again.'}</span>
        </div>
      )}

      {/* Emergency Appointments List */}
      <EmergenciesList initialEmergencies={filteredAppts} />
    </div>
  )
}
