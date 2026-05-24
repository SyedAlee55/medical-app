'use server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

async function logAudit(supabase, payload) {
  try {
    await supabase.rpc('log_audit_event', payload)
  } catch (err) {
    console.error('Audit log failed:', err)
  }
}

async function requireAdminOrCeo(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()
  if (!profile || !['admin','ceo'].includes(profile.role)) redirect('/403')
  return { user, profile }
}

// ─── APPROVE DOCTOR ──────────────────────────────────────────────────────────
export async function approveDoctor(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)
  const targetId = formData.get('userId')

  await supabase
    .from('profiles')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', targetId)
    .in('role', ['doctor','staff'])

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'DOCTOR_APPROVED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: {},
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/approvals?success=approved')
}

// ─── REJECT DOCTOR ───────────────────────────────────────────────────────────
export async function rejectDoctor(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)
  const targetId = formData.get('userId')

  await supabase
    .from('profiles')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', targetId)

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'DOCTOR_REJECTED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: {},
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/approvals?success=rejected')
}

// ─── SUSPEND USER (instant global session kill) ───────────────────────────────
export async function suspendUser(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)
  const targetId = formData.get('userId')

  // Prevent suspending CEO
  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetId)
    .single()
  if (!target || target.role === 'ceo') redirect('/403')

  // Update status
  await supabase
    .from('profiles')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', targetId)

  // Auto-cancel any active future appointments for this user (both as patient and doctor)
  const now = new Date().toISOString()
  await supabase
    .from('appointments')
    .update({ 
      status: 'cancelled', 
      cancelled_at: now, 
      cancellation_reason: 'Account suspended by administrator',
      updated_at: now
    })
    .or(`patient_id.eq.${targetId},doctor_id.eq.${targetId}`)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', now)

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'USER_SUSPENDED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { target_role: target.role },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/users?success=suspended')
}

// Helper to get or create external patient placeholder user
async function getOrCreateExternalPatientPlaceholder(supabaseAdmin) {
  const email = 'external_patient_placeholder@system.local'
  
  // Try to find the profile first
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()
    
  if (existingProfile) {
    return existingProfile.id
  }
  
  // Not found, create an auth user using Admin API (which triggers profile creation)
  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'SystemExternalPatientPlaceholderPassword123!',
    email_confirm: true,
    user_metadata: {
      full_name: 'External Patient',
      role: 'patient'
    }
  })
  
  if (createError) {
    console.error('Failed to create external patient placeholder auth user:', createError)
    throw new Error('Failed to create placeholder user')
  }
  
  // Wait for the DB trigger to insert the profile row (retry up to 5 times)
  let attempts = 0
  while (attempts < 5) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', authUser.user.id)
      .single()
      
    if (profile) return profile.id
    await new Promise(resolve => setTimeout(resolve, 200))
    attempts++
  }
  
  return authUser.user.id
}

// ─── CREATE APPOINTMENT ───────────────────────────────────────────────────────
export async function createAppointment(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)

  const patientType  = formData.get('patient_type') || 'registered'
  let patientId      = formData.get('patient_id')
  const externalName = formData.get('external_name')
  const externalContact = formData.get('external_contact')
  const doctorId     = formData.get('doctor_id')
  const scheduledAt  = formData.get('scheduled_at')
  let reason         = (formData.get('reason_for_visit') || '').slice(0, 500)
  const notes        = (formData.get('notes') || '').slice(0, 500)

  // Validate fields based on type
  if (patientType === 'external') {
    if (!externalName || !externalContact || !doctorId || !scheduledAt || !reason) {
      redirect('/admin/appointments?error=missing_fields')
    }
  } else {
    if (!patientId || !doctorId || !scheduledAt || !reason) {
      redirect('/admin/appointments?error=missing_fields')
    }
  }

  const scheduledDate = new Date(scheduledAt)
  if (isNaN(scheduledDate.getTime())) {
    redirect('/admin/appointments?error=past_datetime')
  }

  if (scheduledDate < new Date()) {
    redirect('/admin/appointments?error=past_datetime')
  }

  const { data: doctor } = await supabase
    .from('profiles')
    .select('id, role, status')
    .eq('id', doctorId)
    .single()

  if (!doctor || doctor.role !== 'doctor' || doctor.status !== 'active') {
    redirect('/admin/appointments?error=invalid_doctor')
  }

  // Resolve patient_id
  if (patientType === 'external') {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    try {
      patientId = await getOrCreateExternalPatientPlaceholder(supabaseAdmin)
      // Prefix reason_for_visit with external patient details
      reason = `[External: ${externalName}, ${externalContact}] ${reason}`.slice(0, 500)
    } catch (err) {
      console.error(err)
      redirect('/admin/appointments?error=create_failed')
    }
  } else {
    const { data: patient } = await supabase
      .from('profiles')
      .select('id, role, status')
      .eq('id', patientId)
      .single()

    if (!patient || patient.role !== 'patient' || patient.status !== 'active') {
      redirect('/admin/appointments?error=invalid_patient')
    }
  }

  const { data: newAppt, error: insertError } = await supabase
    .from('appointments')
    .insert({
      patient_id:       patientId,
      doctor_id:        doctorId,
      scheduled_at:     scheduledAt,
      reason_for_visit: reason,
      notes:            notes,
      duration_minutes: 30,
      status:           'pending'
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('CREATE_APPOINTMENT_ERROR:', insertError.message)
    redirect('/admin/appointments?error=create_failed')
  }

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'APPOINTMENT_CREATED',
    p_target_type: 'appointment',
    p_target_id: newAppt.id,
    p_metadata: { doctor_id: doctorId, patient_id: patientId, scheduled_at: scheduledAt },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/appointments?success=created')
}

// ─── REACTIVATE USER ─────────────────────────────────────────────────────────
export async function reactivateUser(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)
  const targetId = formData.get('userId')

  const { data: target } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', targetId)
    .single()
    
  if (!target || target.status !== 'suspended') {
    return
  }

  await supabase
    .from('profiles')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', targetId)

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'USER_REACTIVATED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { target_role: target.role },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/users?success=reactivated')
}

// ─── DELETE USER ──────────────────────────────────────────────────────────────
export async function deleteUser(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)
  const targetId = formData.get('userId')

  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetId)
    .single()
  if (!target || target.role === 'ceo') redirect('/403')

  const { data: activeAppointments } = await supabase
    .from('appointments')
    .select('id')
    .or(`patient_id.eq.${targetId},doctor_id.eq.${targetId}`)
    .in('status', ['pending', 'confirmed'])
    .limit(1)

  if (activeAppointments && activeAppointments.length > 0) {
    redirect('/admin/users?error=has_active_appointments')
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { error } = await supabaseAdmin.auth.admin.deleteUser(targetId)
  if (error) {
    console.error('Delete user failed:', error)
    redirect('/admin/users?error=delete_failed')
  }

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'USER_DELETED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { target_role: target.role },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/users?success=deleted')
}
