'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 2. Extract common data
    const fullName = formData.get('fullName')
    const role = user.user_metadata?.role

    const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
    }

    // 3. Add role-specific data
    if (role === 'patient') {
        updates.medical_history = formData.get('medicalHistory')
    } else if (role === 'doctor') {
        updates.bio = formData.get('bio')
        updates.specialty_id = formData.get('specialtyId')
    }

    // 4. Update the database
    const { error } = await supabase
        .from('profiles')
        .upsert(updates)

    if (error) {
        console.error("Profile Update Error:", error.message)
        return { success: false, error: error.message }
    }

    // 5. Success! Refresh the page
    revalidatePath('/profile')
    return { success: true }
}
