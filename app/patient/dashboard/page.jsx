import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PatientAppointmentList from "@/components/patient-appointment-list";

export default async function PatientDashboard({ searchParams }) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // 1. Fetch Profile for Onboarding Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, date_of_birth')
        .eq('id', user.id)
        .single();

    if (!profile) {
        redirect("/login");
    }

    if (!profile.date_of_birth) {
        redirect('/patient/onboarding');
    }

    // 2. Fetch Appointments for this Patient
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            scheduled_at,
            reason_for_visit,
            status,
            profiles:doctor_id (full_name),
            specialties:specialty_id (name)
        `)
        .eq('patient_id', user.id)
        .is('deleted_at', null)
        .order('scheduled_at', { ascending: false });

    const params = await searchParams
    const isWelcome = params?.welcome === 'true'

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {isWelcome && (
                    <div className="mb-6 p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md animate-in fade-in duration-300">
                        Your profile has been saved. Welcome to Tj's Medical Hub.
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-blue-600">{profile.full_name}</span></p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">Your Consultations</h2>
                    <PatientAppointmentList 
                        initialAppointments={appointments || []} 
                        userId={user.id} 
                    />
                </div>
            </div>
        </div>
    );
}