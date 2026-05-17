import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppointmentList from '@/components/appointment-list'
import RealTimeClock from '@/components/real-time-clock'
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
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
            id,
            scheduled_at,
            reason_for_visit,
            status,
            profiles:patient_id (full_name),
            specialties:specialty_id (name)
        `)
        .eq('doctor_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('scheduled_at', now)
        .is('deleted_at', null)
        .order('scheduled_at', { ascending: true })

    // 3. Fetch History (Rejected or Past appointments)
    const { data: historyAppointments } = await supabase
        .from('appointments')
        .select(`
            id,
            scheduled_at,
            reason_for_visit,
            status,
            profiles:patient_id (full_name),
            specialties:specialty_id (name)
        `)
        .eq('doctor_id', user.id)
        .or(`status.eq.rejected,status.eq.cancelled,status.eq.completed,scheduled_at.lt.${now}`)
        .is('deleted_at', null)
        .order('scheduled_at', { ascending: false })
        .limit(10)

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
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
                        <CardHeader>
                            <CardTitle>Consultation History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {historyAppointments?.length > 0 ? (
                                    historyAppointments.map((apt) => (
                                        <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg opacity-75">
                                            <div>
                                                <p className="font-semibold text-slate-700">{apt.profiles?.full_name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(apt.scheduled_at).toLocaleString()} • {apt.specialties?.name}
                                                </p>
                                            </div>
                                            <Badge variant={apt.status === 'rejected' ? 'destructive' : 'outline'}>
                                                {apt.status === 'rejected' ? 'Rejected' : 'Completed'}
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