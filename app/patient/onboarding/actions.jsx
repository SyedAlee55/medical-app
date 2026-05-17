'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePatientProfile(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'patient') redirect('/login')

  const updates = {
    date_of_birth:  formData.get('dob') || null,
    gender:         formData.get('gender') || null,
    allergies:      formData.get('allergies') || null,
    medical_history: formData.get('history') || null,
    updated_at:     new Date().toISOString(),
  }

  // Remove nulls so we don't overwrite existing data with nothing
  Object.keys(updates).forEach(k => {
    if (updates[k] === null) delete updates[k]
  })

  console.log('SAVING_PATIENT_PROFILE:', updates)

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error('PROFILE_SAVE_ERROR:', error.message)
    redirect('/patient/onboarding?error=save_failed')
  }

  redirect('/patient/dashboard?welcome=true')
}