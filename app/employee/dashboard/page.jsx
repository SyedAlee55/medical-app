import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppointmentList from '@/components/appointment-list' // We will create this next

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // 2. Initial Server-Side Fetch (for SEO and fast initial load)
    const { data: initialAppointments } = await supabase
        .from('appointments')
        .select(`
            id,
            appointment_date,
            reason_for_visit,
            status,
            profiles:patient_id (full_name),
            specialties:specialty_id (name)
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: true })

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900">Medical Dashboard</h1>
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
                            <CardTitle>Upcoming Consultations</CardTitle>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
                                Live
                            </span>
                        </CardHeader>
                        <CardContent>
                            {/* We pass the initial data to the Client Component */}
                            <AppointmentList
                                initialAppointments={initialAppointments || []}
                                userId={user.id}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}