'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { resend } from '@/utils/resend'
import AppointmentAcceptedEmail from '@/emails/accepted'
import AppointmentRejectedEmail from '@/emails/rejected'

/**
 * Updates the status of an appointment.
 * This is protected by RLS on the database level.
 */
export async function updateAppointmentStatus(appointmentId, status) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

    if (error) {
        console.error('Failed to update appointment status:', error.message)
        return { success: false, error: error.message }
    }

    // 2. Send Notification Email to Patient (Task 2 & 3)
    try {
        const { data: aptData } = await supabase
            .from('appointments')
            .select(`
                appointment_date,
                profiles:patient_id(email, full_name),
                doctor:doctor_id(full_name),
                specialties:specialty_id(name)
            `)
            .eq('id', appointmentId)
            .single()

        if (aptData?.profiles?.email) {
            const EmailTemplate = status === 'accepted' ? AppointmentAcceptedEmail : AppointmentRejectedEmail
            const subject = status === 'accepted' ? "Your Visit is Confirmed!" : "Update regarding your medical request"

            await resend.emails.send({
                from: "Medical Hub <onboarding@resend.dev>",
                to: aptData.profiles.email,
                subject: subject,
                react: EmailTemplate({
                    doctorName: aptData.doctor?.full_name || "Specialist",
                    date: new Date(aptData.appointment_date).toLocaleString(),
                    specialty: aptData.specialties?.name || "General",
                }),
            })
        }
    } catch (emailError) {
        console.error("Failed to send status update email:", emailError)
    }

    // 3. Refresh the dashboard to show updated data
    revalidatePath('/employee/dashboard')
    
    return { success: true }
}
