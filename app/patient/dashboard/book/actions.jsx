'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resend } from '@/utils/resend'
import NewRequestEmail from '@/emails/new-request'

export async function createAppointment(formData) {
    const supabase = await createClient()
    
    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 2. Extract form data
    const specialtyId = formData.get('specialty_id')
    const doctorId = formData.get('doctor_id')
    const appointmentDate = formData.get('date')
    const reason = formData.get('reason')

    // 3. Insert into appointments table
    const { error: dbError } = await supabase
        .from('appointments')
        .insert({
            patient_id: user.id,
            doctor_id: doctorId,
            specialty_id: specialtyId,
            appointment_date: appointmentDate,
            reason_for_visit: reason,
            status: 'pending'
        })

    if (dbError) {
        console.error("Booking Error:", dbError.message)
        return { error: dbError.message }
    }

    // 4. Send Email Notification to Doctor (Task 2 & 3)
    try {
        // Fetch doctor's email and specialty name
        const { data: doctorData } = await supabase
            .from('profiles')
            .select('email, full_name, specialties:specialty_id(name)')
            .eq('id', doctorId)
            .single()

        if (doctorData?.email) {
            await resend.emails.send({
                from: "Medical Hub <onboarding@resend.dev>", // Replace with your verified domain
                to: doctorData.email,
                subject: "New Appointment Request",
                react: NewRequestEmail({
                    patientName: user.user_metadata?.full_name || user.email,
                    specialty: doctorData.specialties?.name || "General",
                    date: new Date(appointmentDate).toLocaleString(),
                }),
            });
        }
    } catch (emailError) {
        // Log the error but don't fail the booking
        console.error("Failed to send notification email to doctor:", emailError)
    }

    // 5. Success! Redirect to patient dashboard
    redirect('/patient/dashboard')
}
