'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 2. Fetch current profile role from the DB (absolute source of truth)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    
    if (!profile) throw new Error("Profile not found")

    const role = profile.role

    function clean(val, max = 255) {
        if (!val) return null
        return String(val).replace(/<[^>]*>/g, '').trim().slice(0, max)
    }

    const updates = {
        updated_at: new Date().toISOString(),
    }

    // 3. Map inputs based on role
    if (role === 'doctor' || role === 'staff') {
        const specialtyId = formData.get('specialty_id')
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const validSpecialtyId = specialtyId && uuidRegex.test(specialtyId) ? specialtyId : null

        updates.full_name = clean(formData.get('full_name'))
        updates.phone = clean(formData.get('phone'), 20)
        updates.specialty_id = validSpecialtyId
        updates.department = clean(formData.get('department'))
        updates.bio = clean(formData.get('bio'), 1000)
        updates.employee_id = clean(formData.get('employee_id'), 50)
    } else if (role === 'patient') {
        updates.full_name = clean(formData.get('full_name'))
        updates.phone = clean(formData.get('phone'), 20)
        updates.date_of_birth = formData.get('dob') || null
        updates.gender = formData.get('gender') || null
        updates.allergies = clean(formData.get('allergies'))
        updates.medical_history = clean(formData.get('history'), 1000)
    } else {
        // Fallback for admin / ceo roles
        updates.full_name = clean(formData.get('full_name'))
        updates.phone = clean(formData.get('phone'), 20)
    }

    console.log(`SAVING_PROFILE_FOR_${role.toUpperCase()}:`, updates)

    // 4. Update the database
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        console.error("Profile Update Error:", error.message)
        return { success: false, error: error.message }
    }

    // 5. Success! Refresh the page
    revalidatePath('/profile')
    return { success: true }
}
