import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PatientDashboard() {
    // 1. Initialize Supabase
    const supabase = await createClient();

    // 2. Get the logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // 3. Check if they have finished onboarding (looking for Date of Birth)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, date_of_birth')
        .eq('id', user.id)
        .single();

    // 4. THE BOUNCER: If DOB is missing, force them to onboarding
    if (!profile?.date_of_birth) {
        redirect('/patient/onboarding');
    }

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold text-blue-900">Patient Dashboard</h1>
            <p className="mt-2 text-slate-600">Welcome back, {profile.full_name}</p>

            <div className="mt-10 p-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-slate-400">Your upcoming appointments will appear here.</p>
            </div>
        </div>
    );
}