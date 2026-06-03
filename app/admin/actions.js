'use server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { localDateTimeToUTC } from '@/utils/time'

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
  const scheduledAtRaw = formData.get('scheduled_at')
  const scheduledAt    = localDateTimeToUTC(scheduledAtRaw)
  let reason         = (formData.get('reason_for_visit') || '').slice(0, 500)
  const notes        = (formData.get('notes') || '').slice(0, 500)

  // Validate fields based on type
  if (patientType === 'external') {
    if (!externalName || !externalContact || !doctorId || !scheduledAtRaw || !reason) {
      redirect('/admin/appointments?error=missing_fields')
    }
  } else {
    if (!patientId || !doctorId || !scheduledAtRaw || !reason) {
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

// ─── DELETE USER (FORCE — bypasses all appointment guards) ────────────────────
export async function deleteUser(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)
  const targetId = formData.get('userId')

  // Confirm target exists and is not CEO
  const { data: target } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', targetId)
    .single()
  if (!target || target.role === 'ceo') redirect('/403')

  // Use service-role client to bypass RLS for all cleanup steps
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 1. Hard-delete ALL appointments where this user is patient, doctor, or overrider
  //    (appointments.patient_id / doctor_id reference profiles with no ON DELETE CASCADE,
  //     so we must remove them first or the auth user delete will hit an FK violation)
  const { error: aptError } = await supabaseAdmin
    .from('appointments')
    .delete()
    .or(`patient_id.eq.${targetId},doctor_id.eq.${targetId},overridden_by.eq.${targetId}`)
  if (aptError) {
    console.error('DELETE_USER: appointments cleanup failed:', aptError.message)
    redirect('/admin/users?error=delete_failed')
  }

  // 2. Remove user sessions
  await supabaseAdmin
    .from('user_sessions')
    .delete()
    .eq('user_id', targetId)

  // 3. Nullify actor_id on audit logs so history is preserved but the FK doesn't block
  await supabaseAdmin
    .from('audit_logs')
    .update({ actor_id: null })
    .eq('actor_id', targetId)

  // 4. Delete the auth user — this cascades to profiles via ON DELETE CASCADE
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(targetId)
  if (authError) {
    console.error('DELETE_USER: auth deletion failed:', authError.message)
    redirect('/admin/users?error=delete_failed')
  }

  // Log before redirecting (actor still exists so logging works)
  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'USER_FORCE_DELETED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { target_role: target.role, target_email: target.email },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/users?success=deleted')
}

// ─── RESPOND TO EMERGENCY APPOINTMENT ──────────────────────────────────────────
export async function respondToEmergencyAppointment(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)

  const appointmentId    = formData.get('appointmentId')
  const newStatus        = formData.get('status')
  const rejectionReason  = (formData.get('rejectionReason') || '').slice(0, 500)

  if (!['confirmed', 'rejected'].includes(newStatus)) {
    redirect('/admin/emergencies?error=invalid_status')
  }

  // Fetch the appointment and confirm it is indeed an Emergency appointment
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, doctor_id, patient_id, status, scheduled_at, profiles!appointments_doctor_id_fkey(department)')
    .eq('id', appointmentId)
    .single()

  if (!appt) redirect('/admin/emergencies?error=not_found')
  if (appt.status !== 'pending') {
    redirect('/admin/emergencies?error=already_responded')
  }

  // Confirm doctor department is Emergency
  if (appt.profiles?.department?.toLowerCase() !== 'emergency') {
    redirect('/403')
  }

  // If confirming, check for conflicts
  if (newStatus === 'confirmed') {
    const { data: conflictCheck } = await supabase.rpc('check_appointment_conflict', {
      p_doctor_id:     appt.doctor_id,
      p_scheduled_at:  appt.scheduled_at,
      p_duration_mins: 30,
      p_exclude_id:    appointmentId
    })
    if (conflictCheck?.has_conflict) {
      redirect('/admin/emergencies?error=time_conflict')
    }
  }

  const now = new Date().toISOString()
  const updates = {
    status:     newStatus,
    updated_at: now,
    ...(newStatus === 'confirmed' && { confirmed_at: now }),
    ...(newStatus === 'rejected'  && { rejected_at: now, rejection_reason: rejectionReason }),
  }

  await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)

  logAudit(supabase, {
    p_actor_id: user.id, p_actor_role: profile.role,
    p_action: newStatus === 'confirmed' ? 'EMERGENCY_APPOINTMENT_CONFIRMED' : 'EMERGENCY_APPOINTMENT_REJECTED',
    p_target_type: 'appointment', p_target_id: appointmentId,
    p_metadata: { new_status: newStatus, rejection_reason: rejectionReason, patient_id: appt.patient_id, doctor_id: appt.doctor_id },
    p_ip_address: null, p_user_agent: null
  })

  redirect('/admin/emergencies?success=updated')
}

// ─── VERIFY EMPLOYEE ID ──────────────────────────────────────────────────────
export async function verifyEmployeeId(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)
  
  const targetId = formData.get('userId')
  const approved = formData.get('approved') === 'true'

  const now = new Date().toISOString()
  if (approved) {
    await supabase
      .from('profiles')
      .update({
        employee_id_verified: true,
        employee_id_verified_by: user.id,
        employee_id_verified_at: now,
        updated_at: now
      })
      .eq('id', targetId)
  } else {
    await supabase
      .from('profiles')
      .update({
        employee_id_verified: false,
        employee_id_verified_by: null,
        employee_id_verified_at: null,
        employee_id: null,
        updated_at: now
      })
      .eq('id', targetId)
  }

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: approved ? 'EMPLOYEE_ID_VERIFIED' : 'EMPLOYEE_ID_REJECTED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: {},
    p_ip_address: null,
    p_user_agent: null
  })

  revalidatePath('/admin/employee-ids')
  redirect('/admin/employee-ids?success=' + (approved ? 'verified' : 'rejected'))
}

// ─── EXPORT ACTIVITY LOGS ────────────────────────────────────────────────────
export async function exportActivityLogs(formData) {
  const supabase = await createClient()
  await requireAdminOrCeo(supabase)

  const from = formData.get('from') || null
  const to = formData.get('to') || null
  const actorIdRaw = formData.get('actorId')
  const actionRaw = formData.get('action')

  const actorId = actorIdRaw && actorIdRaw.trim() !== '' ? actorIdRaw.trim() : null
  const action = actionRaw && actionRaw.trim() !== '' ? actionRaw.trim() : null

  const p_from = from ? new Date(from).toISOString() : null
  const p_to = to ? new Date(to).toISOString() : null

  const { data, error } = await supabase.rpc('export_audit_logs', {
    p_from,
    p_to,
    p_actor_id: actorId,
    p_action: action
  })

  if (error) {
    console.error('export_audit_logs RPC failed:', error)
    return { data: null, error: error.message }
  }

  const jsonString = JSON.stringify(data, null, 2)
  const filename = `audit-log-export-${new Date().toISOString().split('T')[0]}.json`

  return {
    data: jsonString,
    filename,
    error: null
  }
}

// ─── UPDATE USER PROFILE ──────────────────────────────────────────────────────
export async function updateUserProfile(formData) {
  const supabase = await createClient()
  const { user, profile } = await requireAdminOrCeo(supabase)

  const targetId = formData.get('userId')
  const full_name = formData.get('full_name')
  const email = formData.get('email')
  const phone = formData.get('phone')
  const department = formData.get('department')
  const specialtyIdRaw = formData.get('specialty_id')
  const employee_id = formData.get('employee_id')
  const notes = formData.get('notes')

  const specialty_id = specialtyIdRaw && specialtyIdRaw.trim() !== '' ? specialtyIdRaw.trim() : null

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      email,
      phone,
      department,
      specialty_id,
      employee_id,
      notes,
      updated_at: now
    })
    .eq('id', targetId)

  if (error) {
    console.error('updateUserProfile failed:', error)
    redirect(`/admin/users/${targetId}/edit?error=update_failed`)
  }

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'USER_PROFILE_UPDATED_BY_ADMIN',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { updated_fields: { full_name, email, phone, department, specialty_id, employee_id } },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/users?success=updated')
}



