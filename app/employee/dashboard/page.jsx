import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppointmentList from '@/components/appointment-list'
import RealTimeClock from '@/components/real-time-clock'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { clearCompletedAppointments } from '@/app/appointments/actions'

function SuccessBanner({ message }) {
  return <div className="mb-6 p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md animate-in fade-in duration-300">{message}</div>;
}

function ErrorBanner({ message }) {
  return <div className="mb-6 p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md animate-in fade-in duration-300">{message}</div>;
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

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {params?.success && <SuccessBanner message={successMsgs[params.success] || 'Action successful.'} />}
                {params?.error && <ErrorBanner message={errorMsgs[params.error] || 'An error occurred.'} />}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-900">Medical Dashboard</h1>
                    <RealTimeClock />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Welcome Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Doctor Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-1">Signed in as:</p>
                            <p className="font-medium text-blue-600 truncate">{user.email}</p>

                            <div className="mt-6 p-4 border border-dashed rounded-md bg-white">
                                <p className="text-xs text-slate-400 italic">
                                    Secure Staff Portal: Verified access for healthcare providers.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task 4.2: Real-time Appointment List */}
                    <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Active Consultations</CardTitle>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full animate-pulse">
                                Upcoming
                            </span>
                        </CardHeader>
                        <CardContent>
                            <AppointmentList
                                initialAppointments={activeAppointments || []}
                                userId={user.id}
                            />
                        </CardContent>
                    </Card>

                    {/* History Section */}
                    <Card className="md:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Consultation History</CardTitle>
                            <form action={clearCompletedAppointments}>
                                <Button type="submit" variant="outline" size="sm">
                                    Clear completed
                                </Button>
                            </form>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {historyAppointments?.length > 0 ? (
                                    historyAppointments.map((apt) => (
                                        <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg opacity-75">
                                            <div>
                                                <p className="font-semibold text-slate-700">{apt.profiles?.full_name || 'Patient'}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(apt.scheduled_at).toLocaleString()} • {apt.specialties?.name || 'General'}
                                                </p>
                                            </div>
                                            <Badge variant={
                                                apt.status === 'rejected' ? 'destructive' : 
                                                apt.status === 'completed' ? 'outline' : 
                                                'secondary'
                                            }>
                                                {apt.status}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No past consultations found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}