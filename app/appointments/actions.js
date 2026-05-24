'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ── Shared helpers ────────────────────────────────────────────────────────────

async function getVerifiedUser(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')
  return user
}

async function getProfile(supabase, userId, requiredRoles = null) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, status, full_name, email')
    .eq('id', userId)
    .single()
  if (!profile) redirect('/login')
  if (requiredRoles && !requiredRoles.includes(profile.role)) redirect('/403')
  if (profile.status === 'suspended') redirect('/suspended')
  return profile
}

async function logAudit(supabase, payload) {
  try {
    await supabase.rpc('log_audit_event', payload)
  } catch (err) {
    console.error('Audit log failed:', err)
  }
}

// ── BOOK APPOINTMENT ─────────────────────────────────────────────────────────
export async function bookAppointment(formData) {
  const supabase = await createClient()
  const user = await getVerifiedUser(supabase)
  const profile = await getProfile(supabase, user.id, ['patient'])

  if (profile.status !== 'active') redirect('/login')

  const doctorId     = formData.get('doctorId')
  const scheduledAt  = formData.get('scheduledAt')
  const reason       = (formData.get('reason') || '').slice(0, 500)
  const specialtyId  = formData.get('specialtyId') || null
  const durationMins = parseInt(formData.get('durationMinutes') || '30', 10)
  const notes        = (formData.get('notes') || '').slice(0, 500)

  // ── Validate inputs ───────────────────────────────────────────────────────
  if (!doctorId || !scheduledAt) {
    redirect('/patient/book?error=missing_fields')
  }

  const scheduledDate = new Date(scheduledAt)
  if (isNaN(scheduledDate.getTime())) {
    redirect('/patient/book?error=invalid_date')
  }

  // Must be at least 1 hour in the future
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
  if (scheduledDate < oneHourFromNow) {
    redirect('/patient/book?error=too_soon')
  }

  // ── Verify doctor exists, is active, and is a doctor ─────────────────────
  const { data: doctor } = await supabase
    .from('profiles')
    .select('id, role, status, full_name, email, specialty_id')
    .eq('id', doctorId)
    .single()

  if (!doctor || !['doctor','staff'].includes(doctor.role) || doctor.status !== 'active') {
    redirect('/patient/book?error=invalid_doctor')
  }

  // ── Conflict detection ────────────────────────────────────────────────────
  const { data: conflictCheck } = await supabase.rpc('check_appointment_conflict', {
    p_doctor_id:     doctorId,
    p_scheduled_at:  scheduledAt,
    p_duration_mins: durationMins,
    p_exclude_id:    null
  })

  if (conflictCheck?.has_conflict) {
    redirect('/patient/book?error=time_conflict')
  }

  // ── Insert appointment ────────────────────────────────────────────────────
  const { data: newAppt, error: insertError } = await supabase
    .from('appointments')
    .insert({
      patient_id:       user.id,      // always from server — never trust client
      doctor_id:        doctorId,
      specialty_id:     specialtyId,
      scheduled_at:     scheduledAt,
      reason_for_visit: reason,
      notes:            notes,
      duration_minutes: durationMins,
      status:           'pending'
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('BOOK_APPOINTMENT_ERROR:', insertError.message)
    redirect('/patient/book?error=booking_failed')
  }

  logAudit(supabase, {
    p_actor_id: user.id, p_actor_role: 'patient',
    p_action: 'APPOINTMENT_BOOKED',
    p_target_type: 'appointment', p_target_id: newAppt.id,
    p_metadata: { doctor_id: doctorId, scheduled_at: scheduledAt, reason },
    p_ip_address: null, p_user_agent: null
  })

  revalidatePath('/patient/dashboard')
  redirect('/patient/dashboard?booked=true')
}

// ── RESPOND TO APPOINTMENT (Doctor accept/reject) ─────────────────────────────
export async function respondToAppointment(formData) {
  const supabase = await createClient()
  const user = await getVerifiedUser(supabase)
  await getProfile(supabase, user.id, ['doctor', 'staff'])

  const appointmentId    = formData.get('appointmentId')
  const newStatus        = formData.get('status')
  const rejectionReason  = (formData.get('rejectionReason') || '').slice(0, 500)

  if (!['confirmed', 'rejected'].includes(newStatus)) {
    redirect('/employee/dashboard?error=invalid_status')
  }

  // Fetch and verify ownership
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, doctor_id, patient_id, status, scheduled_at')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.doctor_id !== user.id) redirect('/403')
  if (appt.status !== 'pending') {
    redirect('/employee/dashboard?error=already_responded')
  }

  // If confirming, check for conflicts one more time
  if (newStatus === 'confirmed') {
    const { data: conflictCheck } = await supabase.rpc('check_appointment_conflict', {
      p_doctor_id:     user.id,
      p_scheduled_at:  appt.scheduled_at,
      p_duration_mins: 30,
      p_exclude_id:    appointmentId
    })
    if (conflictCheck?.has_conflict) {
      redirect('/employee/dashboard?error=time_conflict')
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
    p_actor_id: user.id, p_actor_role: 'doctor',
    p_action: newStatus === 'confirmed' ? 'APPOINTMENT_CONFIRMED' : 'APPOINTMENT_REJECTED',
    p_target_type: 'appointment', p_target_id: appointmentId,
    p_metadata: { new_status: newStatus, rejection_reason: rejectionReason, patient_id: appt.patient_id },
    p_ip_address: null, p_user_agent: null
  })

  revalidatePath('/employee/dashboard')
  redirect('/employee/dashboard?success=updated')
}

// ── CANCEL APPOINTMENT (Patient) ──────────────────────────────────────────────
export async function cancelAppointment(formData) {
  const supabase = await createClient()
  const user = await getVerifiedUser(supabase)
  await getProfile(supabase, user.id, ['patient'])

  const appointmentId      = formData.get('appointmentId')
  const cancellationReason = (formData.get('cancellationReason') || '').slice(0, 500)

  const { data: appt } = await supabase
    .from('appointments')
    .select('id, patient_id, scheduled_at, status')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.patient_id !== user.id) redirect('/403')

  // Cannot cancel completed or already cancelled
  if (['completed', 'cancelled', 'overridden'].includes(appt.status)) {
    redirect('/patient/dashboard?error=cannot_cancel')
  }

  // 2-hour cancellation window enforcement
  const scheduledTime = new Date(appt.scheduled_at).getTime()
  const twoHoursMs    = 2 * 60 * 60 * 1000
  if (Date.now() > scheduledTime - twoHoursMs) {
    redirect('/patient/dashboard?error=too_late_to_cancel')
  }

  const now = new Date().toISOString()
  await supabase
    .from('appointments')
    .update({
      status:              'cancelled',
      cancelled_at:        now,
      cancelled_by:        user.id,
      cancellation_reason: cancellationReason,
      updated_at:          now,
    })
    .eq('id', appointmentId)

  logAudit(supabase, {
    p_actor_id: user.id, p_actor_role: 'patient',
    p_action: 'APPOINTMENT_CANCELLED',
    p_target_type: 'appointment', p_target_id: appointmentId,
    p_metadata: { cancellation_reason: cancellationReason },
    p_ip_address: null, p_user_agent: null
  })

  revalidatePath('/patient/dashboard')
  redirect('/patient/dashboard?cancelled=true')
}

// ── DOCTOR CLEARS COMPLETED APPOINTMENTS ─────────────────────────────────────
export async function clearCompletedAppointments() {
  const supabase = await createClient()
  const user = await getVerifiedUser(supabase)
  await getProfile(supabase, user.id, ['doctor', 'staff'])

  const now = new Date().toISOString()

  // Soft delete — never hard delete appointment records
  const { error } = await supabase
    .from('appointments')
    .update({ deleted_at: now, updated_at: now })
    .eq('doctor_id', user.id)
    .eq('status', 'completed')

  if (error) {
    console.error('CLEAR_COMPLETED_ERROR:', error.message)
    redirect('/employee/dashboard?error=clear_failed')
  }

  logAudit(supabase, {
    p_actor_id: user.id, p_actor_role: 'doctor',
    p_action: 'COMPLETED_APPOINTMENTS_CLEARED',
    p_target_type: 'appointment', p_target_id: null,
    p_metadata: { cleared_by: user.id },
    p_ip_address: null, p_user_agent: null
  })

  revalidatePath('/employee/dashboard')
  redirect('/employee/dashboard?cleared=true')
}

// ── CEO/ADMIN OVERRIDE ────────────────────────────────────────────────────────
export async function ceoOverrideAppointment(formData) {
  const supabase = await createClient()
  const user = await getVerifiedUser(supabase)
  const profile = await getProfile(supabase, user.id, ['ceo', 'admin'])

  const appointmentId  = formData.get('appointmentId')
  const newStatus      = formData.get('status')
  const newScheduledAt = formData.get('scheduledAt') || null
  const overrideNotes  = (formData.get('notes') || '').slice(0, 500)

  const validStatuses = ['confirmed','rejected','cancelled','completed','overridden','pending']
  if (!validStatuses.includes(newStatus)) redirect('/403')

  const { data: before } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single()

  if (!before) redirect('/ceo/appointments?error=not_found')

  // If rescheduling, check conflict for the new time
  if (newScheduledAt && newScheduledAt !== before.scheduled_at) {
    const { data: conflictCheck } = await supabase.rpc('check_appointment_conflict', {
      p_doctor_id:     before.doctor_id,
      p_scheduled_at:  newScheduledAt,
      p_duration_mins: before.duration_minutes || 30,
      p_exclude_id:    appointmentId
    })
    if (conflictCheck?.has_conflict) {
      redirect('/ceo/appointments?error=reschedule_conflict')
    }
  }

  const now = new Date().toISOString()
  await supabase
    .from('appointments')
    .update({
      status:        newStatus,
      overridden_by: user.id,
      notes:         overrideNotes || before.notes,
      updated_at:    now,
      ...(newScheduledAt && { scheduled_at: newScheduledAt }),
    })
    .eq('id', appointmentId)

  logAudit(supabase, {
    p_actor_id: user.id, p_actor_role: profile.role,
    p_action: 'APPOINTMENT_OVERRIDDEN',
    p_target_type: 'appointment', p_target_id: appointmentId,
    p_metadata: {
      before: { status: before.status, scheduled_at: before.scheduled_at },
      after:  { status: newStatus, scheduled_at: newScheduledAt || before.scheduled_at },
      notes:  overrideNotes
    },
    p_ip_address: null, p_user_agent: null
  })

  revalidatePath('/ceo/appointments')
  redirect('/ceo/appointments?success=overridden')
}
