'use server' // Switch to Server Action for better security/reliability

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePatientProfile(formData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("No user found")

    // Extract and clean the data
    const dob = formData.get('dob')
    const gender = formData.get('gender')
    const allergies = formData.get('allergies')
    const history = formData.get('history')

    const updates = {
        id: user.id,
        date_of_birth: dob || null, // Ensure empty strings become null
        medical_history: history || null,
        allergies: allergies || null,
        // Add gender if you added that column to your SQL, otherwise remove this line
        updated_at: new Date().toISOString(),
    }

    // Use .update() instead of .upsert() since the trigger already created the row
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        console.error("Supabase Error:", error.message)
        return { error: error.message }
    }

    // Redirect to dashboard on success
    redirect('/patient/dashboard')
}