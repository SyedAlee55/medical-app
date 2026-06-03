import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookingForm from './BookingForm'
import OverrideAction from './OverrideAction'
import { CheckCircle2, AlertCircle, ExternalLink, Calendar, Clock, TrendingUp, XCircle } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

export const dynamic = 'force-dynamic'

function parseExternalReason(reason) {
  if (reason && reason.startsWith('[External:')) {
    const match = reason.match(/^\[External:\s*([^,\]]+)(?:,\s*([^\]]+))?\]\s*(.*)$/)
    if (match) return { isExternal: true, name: match[1], contact: match[2] || '', reason: match[3] }
  }
  return { isExternal: false, name: '', contact: '', reason: reason || '' }
}

const STATUS_CLASSES = {
  completed: 'bg-zinc-500/10 text-zinc-400 border border-zinc-800',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  rejected:  'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default async function AdminAppointmentsPage({ searchParams }) {
  const supabase = await createClient()
  const params = await searchParams

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

  // Parallel data fetches
  const [
    { data: allAppointments },
    { data: doctors },
    { data: patients },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(full_name),
        doctor:profiles!appointments_doctor_id_fkey(full_name)
      `)
      .order('scheduled_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, email, department, specialties(name)').eq('role', 'doctor').eq('status', 'active'),
    supabase.from('profiles').select('id, full_name, email').eq('role', 'patient').eq('status', 'active').neq('email', 'external_patient_placeholder@system.local'),
  ])

  const appointments = allAppointments || []

  // Derived stats
  const now       = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd   = todayStart + 24 * 60 * 60 * 1000 - 1
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  const totalToday         = appointments.filter(a => { const t = new Date(a.scheduled_at).getTime(); return t >= todayStart && t <= todayEnd }).length
  const upcomingCount      = appointments.filter(a => ['pending','confirmed'].includes(a.status) && new Date(a.scheduled_at).getTime() >= now.getTime()).length
  const completedThisMonth = appointments.filter(a => a.status === 'completed' && new Date(a.scheduled_at).getTime() >= monthStart).length
  const cancelledThisMonth = appointments.filter(a => ['cancelled','rejected'].includes(a.status) && new Date(a.scheduled_at).getTime() >= monthStart).length

  // Tab filtering
  const activeTab = params?.tab || 'upcoming'
  let filteredAppointments = []
  if (activeTab === 'upcoming')   filteredAppointments = appointments.filter(a => ['pending','confirmed'].includes(a.status) && new Date(a.scheduled_at).getTime() >= now.getTime()).sort((a,b) => new Date(a.scheduled_at)-new Date(b.scheduled_at))
  else if (activeTab === 'completed') filteredAppointments = appointments.filter(a => a.status === 'completed')
  else if (activeTab === 'cancelled') filteredAppointments = appointments.filter(a => ['cancelled','rejected'].includes(a.status))
  else filteredAppointments = appointments

  const counts = {
    upcoming:  upcomingCount,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => ['cancelled','rejected'].includes(a.status)).length,
    all:       appointments.length,
  }
  const tabs = [
    { id: 'upcoming',  label: 'Upcoming'  },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'all',       label: 'All'       },
  ]
  const errorMessages = {
    missing_fields: 'Please fill in all required fields',
    past_datetime:  'Appointment time must be in the future',
    invalid_doctor: 'Selected doctor is not available',
    invalid_patient:'Selected patient account is not active',
    create_failed:  'An error occurred while booking the appointment',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Appointments</h1>
        <p className="type-body text-zinc-400 text-sm mt-0.5">Manage all appointments across the platform.</p>
      </div>

      {/* Banners */}
      {params?.success === 'created' && (
        <div className="p-4 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Appointment successfully booked.</span>
        </div>
      )}
      {params?.error && (
        <div className="p-4 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessages[params.error] || 'An unexpected error occurred.'}</span>
        </div>
      )}

      {/* External Requests Notice */}
      <div className="bg-zinc-900 rounded-2xl border-l-4 border-l-brand-500 border border-zinc-800 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">External Appointment Requests</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Appointments booked via the public Calendly form are sent to the admin email. Review them there and use the &apos;Book New Appointment&apos; form below to add them into the system manually.
          </p>
        </div>
        <a
          href="https://calendly.com/app/scheduled_events"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-2.5 text-xs transition shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Calendly Dashboard
        </a>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Today',        value: totalToday,         icon: Calendar,    colorClass: 'bg-zinc-950 border border-zinc-800 text-zinc-400' },
          { label: 'Upcoming',           value: upcomingCount,      icon: Clock,       colorClass: 'bg-brand-500/10 border border-brand-500/20 text-brand-400' },
          { label: 'Completed (Month)',  value: completedThisMonth, icon: TrendingUp,  colorClass: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' },
          { label: 'Cancelled (Month)',  value: cancelledThisMonth, icon: XCircle,     colorClass: 'bg-red-500/10 border border-red-500/20 text-red-400' },
        ].map(({ label, value, icon: Icon, colorClass }) => (
          <div key={label} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="type-label text-zinc-400">{label}</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Table with tab bar */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-zinc-800 px-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/admin/appointments?tab=${tab.id}`}
              className={`py-4 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {counts[tab.id]}
              </span>
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Date &amp; Time</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(a => {
                  const parsed = parseExternalReason(a.reason_for_visit)
                  const statusClass = STATUS_CLASSES[a.status] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-800'
                  return (
                    <tr key={a.id} className="hover:bg-zinc-800/20 transition">
                      <td className="px-6 py-4 font-semibold text-zinc-100">
                        {parsed.isExternal ? (
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5">
                              {parsed.name}
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">External</span>
                            </span>
                            <span className="text-xs text-zinc-500 font-normal">{parsed.contact}</span>
                          </div>
                        ) : (
                          a.patient?.full_name || 'Unknown'
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{a.doctor?.full_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-400">
                        {new Date(a.scheduled_at).toLocaleString([], { timeZone: GLOBAL_TIMEZONE,  dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 max-w-[180px] truncate text-xs text-zinc-400" title={parsed.isExternal ? parsed.reason : a.reason_for_visit}>
                        {parsed.isExternal ? parsed.reason : (a.reason_for_visit || '—')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusClass}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 items-center">
                          {parsed.isExternal ? (
                            <span className="border border-zinc-800 text-zinc-500 font-semibold rounded-lg px-2.5 py-1.5 text-xs">
                              External Patient
                            </span>
                          ) : (
                            <Link
                              href={`/admin/users/${a.patient_id}`}
                              className="border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer whitespace-nowrap"
                            >
                              View Patient
                            </Link>
                          )}
                          <Link
                            href={`/admin/users/${a.doctor_id}`}
                            className="border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer whitespace-nowrap"
                          >
                            View Doctor
                          </Link>
                          <div className="relative">
                            <OverrideAction 
                              appointmentId={a.id} 
                              currentStatus={a.status} 
                              currentScheduledAt={a.scheduled_at} 
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-zinc-500 italic text-sm">
                    {activeTab === 'upcoming'  && 'No upcoming appointments scheduled.'}
                    {activeTab === 'completed' && 'No completed appointments found.'}
                    {activeTab === 'cancelled' && 'No cancelled appointments found.'}
                    {activeTab === 'all'       && 'No appointments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Form */}
      <BookingForm patients={patients || []} doctors={doctors || []} />
    </div>
  )
}
