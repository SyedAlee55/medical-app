import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import BookingForm from './BookingForm'

export const dynamic = 'force-dynamic'

function parseExternalReason(reason) {
  if (reason && reason.startsWith('[External:')) {
    const match = reason.match(/^\[External:\s*([^,\]]+)(?:,\s*([^\]]+))?\]\s*(.*)$/);
    if (match) {
      return {
        isExternal: true,
        name: match[1],
        contact: match[2] || '',
        reason: match[3]
      };
    }
  }
  return {
    isExternal: false,
    name: '',
    contact: '',
    reason: reason || ''
  };
}

const getStatusBadge = (status) => {
  switch (status) {
    case 'completed': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>
    case 'confirmed': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>
    case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    case 'cancelled': return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
    case 'rejected': return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
    default: return <Badge variant="secondary" className="capitalize">{status}</Badge>
  }
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
    { data: specialties }
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
    supabase.from('specialties').select('*')
  ])

  const appointments = allAppointments || []

  // Derived Stats
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  const totalToday = appointments.filter(a => {
    const t = new Date(a.scheduled_at).getTime()
    return t >= todayStart && t <= todayEnd
  }).length

  const upcomingCount = appointments.filter(a => 
    ['pending', 'confirmed'].includes(a.status) && new Date(a.scheduled_at).getTime() >= now.getTime()
  ).length

  const completedThisMonth = appointments.filter(a => 
    a.status === 'completed' && new Date(a.scheduled_at).getTime() >= monthStart
  ).length

  const cancelledThisMonth = appointments.filter(a => 
    ['cancelled', 'rejected'].includes(a.status) && new Date(a.scheduled_at).getTime() >= monthStart
  ).length

  // Tab Filtering
  const activeTab = params?.tab || 'upcoming'

  let filteredAppointments = []
  if (activeTab === 'upcoming') {
    filteredAppointments = appointments
      .filter(a => ['pending', 'confirmed'].includes(a.status) && new Date(a.scheduled_at).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)) // Soonest first
  } else if (activeTab === 'completed') {
    filteredAppointments = appointments.filter(a => a.status === 'completed')
  } else if (activeTab === 'cancelled') {
    filteredAppointments = appointments.filter(a => ['cancelled', 'rejected'].includes(a.status))
  } else {
    filteredAppointments = appointments
  }

  // Count Badges
  const counts = {
    upcoming: upcomingCount,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => ['cancelled', 'rejected'].includes(a.status)).length,
    all: appointments.length
  }

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'all', label: 'All' },
  ]

  // Error messaging map
  const errorMessages = {
    missing_fields: "Please fill in all required fields",
    past_datetime: "Appointment time must be in the future",
    invalid_doctor: "Selected doctor is not available",
    invalid_patient: "Selected patient account is not active",
    create_failed: "An error occurred while booking the appointment"
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Appointments</h1>
        <p className="text-zinc-500">Manage all appointments across the system.</p>
      </div>

      {params?.success === 'created' && (
        <div className="p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md">
          Appointment successfully booked.
        </div>
      )}

      {params?.error && (
        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errorMessages[params.error] || "An unexpected error occurred."}
        </div>
      )}

      {/* External Requests Section */}
      <Card className="border-l-4 border-l-indigo-600 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">External Appointment Requests</h2>
            <p className="text-sm text-zinc-500 max-w-2xl">
              Appointments booked via the public Calendly form are sent to the admin email. Review them there and use the &apos;Book New Appointment&apos; form below to add them into the system manually.
            </p>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
            <a 
              href="https://calendly.com/app/scheduled_events" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Open Calendly Dashboard
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Section 1 - Summary Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-zinc-500 mb-1">Total Today</div>
            <div className="text-2xl font-bold">{totalToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-zinc-500 mb-1">Upcoming</div>
            <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-zinc-500 mb-1">Completed (Month)</div>
            <div className="text-2xl font-bold text-emerald-600">{completedThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-zinc-500 mb-1">Cancelled (Month)</div>
            <div className="text-2xl font-bold text-red-600">{cancelledThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2 - Upcoming & Ongoing Appointments Table */}
      <Card>
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 flex gap-6 overflow-x-auto">
          {tabs.map(tab => (
            <Link 
              key={tab.id}
              href={`/admin/appointments?tab=${tab.id}`}
              className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id 
                  ? 'bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-100' 
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {counts[tab.id]}
              </span>
            </Link>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Doctor</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(a => {
                  const parsed = parseExternalReason(a.reason_for_visit);
                  return (
                    <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-zinc-100">
                        {parsed.isExternal ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                              {parsed.name}
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] py-0 px-1.5 h-4">External</Badge>
                            </span>
                            <span className="text-xs text-zinc-500 font-normal">{parsed.contact}</span>
                          </div>
                        ) : (
                          a.patient?.full_name || 'Unknown'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {a.doctor?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                        {new Date(a.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-zinc-500" title={parsed.isExternal ? parsed.reason : a.reason_for_visit}>
                        {parsed.isExternal ? parsed.reason : (a.reason_for_visit || '-')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(a.status)}
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        {parsed.isExternal ? (
                          <Button variant="outline" size="sm" disabled>
                            External Patient
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/${a.patient_id}`}>View Patient</Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${a.doctor_id}`}>View Doctor</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    {activeTab === 'upcoming' && 'No upcoming appointments scheduled.'}
                    {activeTab === 'completed' && 'No completed appointments found.'}
                    {activeTab === 'cancelled' && 'No cancelled appointments found.'}
                    {activeTab === 'all' && 'No appointments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 3 - Book Appointment Form */}
      <BookingForm patients={patients || []} doctors={doctors || []} />
    </div>
  )
}
