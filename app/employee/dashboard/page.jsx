import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AppointmentList from '@/components/appointment-list'
import RealTimeClock from '@/components/real-time-clock'
import { clearCompletedAppointments } from '@/app/appointments/actions'
import { ShieldCheck, AlertCircle, Clock, FileText, User } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

function SuccessBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="mb-6 p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const now = new Date().toISOString()

  // 2. Fetch Active Appointments (Pending or Accepted, in the future)
  const { data: activeAppointments } = await supabase
    .from('appointments')
    .select(`
        id, status, scheduled_at, reason_for_visit, notes,
        duration_minutes, created_at,
        profiles!appointments_patient_id_fkey(full_name, phone),
        specialties(name)
    `)
    .eq('doctor_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', now)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: true })

  // 3. Fetch History
  const { data: historyAppointments } = await supabase
    .from('appointments')
    .select(`
        id, status, scheduled_at, reason_for_visit, notes,
        duration_minutes, created_at,
        profiles!appointments_patient_id_fkey(full_name, phone),
        specialties(name)
    `)
    .eq('doctor_id', user.id)
    .or(`status.eq.rejected,status.eq.cancelled,status.eq.completed,status.eq.overridden,scheduled_at.lt.${now}`)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  const successMsgs = {
    updated: 'Appointment status updated successfully.',
    cleared: 'Completed appointments cleared.'
  }
  const errorMsgs = {
    time_conflict: 'That time slot is already taken. Conflict detected.',
    already_responded: 'This appointment has already been responded to.',
    invalid_status: 'Invalid status provided.',
    clear_failed: 'Failed to clear completed appointments.'
  }

  const STATUS_CLASSES = {
    pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
    confirmed: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
    rejected: 'bg-red-500/15 text-red-300 border border-red-500/20',
    cancelled: 'bg-zinc-800/20 text-zinc-400 border border-zinc-750/50',
    completed: 'bg-zinc-800/20 text-zinc-400 border border-zinc-750/50',
    overridden: 'bg-brand-500/15 text-brand-300 border border-brand-500/20',
  }

  return (
    <div className="p-8 bg-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {params?.success && <SuccessBanner message={successMsgs[params.success] || 'Action successful.'} />}
        {params?.error && <ErrorBanner message={errorMsgs[params.error] || 'An error occurred.'} />}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Medical Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">Manage your active consultations and history</p>
          </div>
          <RealTimeClock />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Welcome/Profile Card */}
          <div className="bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-brand-500/25 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-brand-300">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base">Doctor Profile</h3>
              </div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Signed in as:</p>
              <p className="font-semibold text-brand-300 truncate text-sm mt-1">{user.email}</p>
            </div>

            <div className="mt-8 p-4 border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-xs text-zinc-400 italic leading-relaxed">
                Secure Staff Portal: Verified access for authorized healthcare providers.
              </p>
            </div>
          </div>

          {/* Active Consultations Card */}
          <div className="bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-sm md:col-span-2 hover:border-brand-500/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-base">Active Consultations</h3>
              <span className="px-2.5 py-0.5 bg-brand-500/15 border border-brand-400/30 text-brand-300 text-[10px] font-semibold tracking-wider uppercase rounded-full animate-pulse">
                Upcoming
              </span>
            </div>
            <AppointmentList
              initialAppointments={activeAppointments || []}
              userId={user.id}
            />
          </div>

          {/* History Section Card */}
          <div className="bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-sm md:col-span-3 hover:border-brand-500/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h3 className="font-semibold text-white text-base">Consultation History</h3>
              <form action={clearCompletedAppointments}>
                <button
                  type="submit"
                  className="bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white font-semibold rounded-lg px-3 py-1.5 text-xs transition cursor-pointer"
                >
                  Clear completed
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {historyAppointments && historyAppointments.length > 0 ? (
                historyAppointments.map((apt) => {
                  const statusClass = STATUS_CLASSES[apt.status] || 'bg-zinc-800/20 text-zinc-400 border border-zinc-700/50'
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/8 rounded-xl hover:bg-white/10 transition">
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {apt.profiles?.full_name || 'Patient'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-450 mt-1 font-medium">
                          <span>
                            {new Date(apt.scheduled_at).toLocaleString('en-US', { timeZone: GLOBAL_TIMEZONE, 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-brand-300">{apt.specialties?.name || 'General'}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass}`}>
                        {apt.status.toUpperCase()}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-zinc-500 font-medium italic">No past consultations found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}