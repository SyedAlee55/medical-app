'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function saveDoctorProfile(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['doctor','staff'].includes(profile.role)) redirect('/login')

  function clean(val, max = 255) {
    if (!val) return null
    return String(val).replace(/<[^>]*>/g, '').trim().slice(0, max)
  }

  const specialtyId = formData.get('specialty_id')
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const validSpecialtyId = specialtyId && uuidRegex.test(specialtyId) ? specialtyId : null

  const updates = {
    full_name:    clean(formData.get('full_name')),
    phone:        clean(formData.get('phone'), 20),
    specialty_id: validSpecialtyId,
    department:   clean(formData.get('department')),
    bio:          clean(formData.get('bio'), 1000),
    employee_id:  clean(formData.get('employee_id'), 50),
    updated_at:   new Date().toISOString(),
  }

  Object.keys(updates).forEach(k => { if (updates[k] === null) delete updates[k] })

  console.log('SAVING_DOCTOR_PROFILE:', updates)

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error('DOCTOR_PROFILE_SAVE_ERROR:', error.message)
    redirect('/employee/onboarding?error=save_failed')
  }

  redirect('/waiting-room')
}
