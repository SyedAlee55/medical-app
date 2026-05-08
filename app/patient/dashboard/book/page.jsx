import { createClient } from '@/utils/supabase/server';
import BookingForm from '@/components/booking-form';

export default async function BookAppointmentPage() {
    const supabase = await createClient();

    // 1. Fetch specialties
    const { data: specialties } = await supabase
        .from('specialties')
        .select('id, name')
        .order('name');

    // 2. Fetch doctors with their specialty_id and bio
    const { data: doctors } = await supabase
        .from('profiles')
        .select('id, full_name, specialty_id, bio')
        .eq('role', 'doctor');

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Book an Appointment</h1>
                <p className="text-slate-500">Select a medical specialty followed by a healthcare provider.</p>
            </div>

            <BookingForm 
                specialties={specialties || []} 
                doctors={doctors || []} 
            />
        </div>
    );
}