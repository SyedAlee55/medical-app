'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

function logAudit(supabase, payload) {
  supabase.rpc('log_audit_event', payload).catch(err =>
    console.error('Audit log failed:', err))
}

// ─── BOOK APPOINTMENT (patient only) ─────────────────────────────────────────
export async function bookAppointment(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'patient' || profile.status !== 'active') {
    redirect('/403')
  }

  const doctorId = formData.get('doctorId')
  const scheduledAt = formData.get('scheduledAt')
  const reason = formData.get('reason')?.slice(0, 500) || ''
  const specialtyId = formData.get('specialtyId') || null

  if (!doctorId || !scheduledAt) redirect('/patient/appointments?error=missing_fields')

  // Verify the target is actually a doctor
  const { data: doctor } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', doctorId)
    .single()

  if (!doctor || doctor.role !== 'doctor' || doctor.status !== 'active') {
    redirect('/patient/appointments?error=invalid_doctor')
  }

  const { error } = await supabase.from('appointments').insert({
    patient_id: user.id,   // Always use server-side user.id — never trust client
    doctor_id: doctorId,
    specialty_id: specialtyId,
    scheduled_at: scheduledAt,
    reason_for_visit: reason,
    status: 'pending'
  })

  if (error) redirect('/patient/appointments?error=booking_failed')

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: 'patient',
    p_action: 'APPOINTMENT_BOOKED',
    p_target_type: 'appointment',
    p_target_id: null,
    p_metadata: { doctorId, scheduledAt },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/patient/appointments?success=booked')
}

// ─── RESPOND TO APPOINTMENT (doctor only) ────────────────────────────────────
export async function respondToAppointment(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const appointmentId = formData.get('appointmentId')
  const newStatus = formData.get('status') // 'confirmed' or 'rejected'

  if (!['confirmed', 'rejected'].includes(newStatus)) redirect('/403')

  // Verify this doctor owns this appointment
  const { data: appt } = await supabase
    .from('appointments')
    .select('doctor_id, status')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.doctor_id !== user.id) redirect('/403')
  if (appt.status !== 'pending') redirect('/employee/appointments?error=already_responded')

  const before = { ...appt }

  await supabase
    .from('appointments')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: 'doctor',
    p_action: newStatus === 'confirmed' ? 'APPOINTMENT_CONFIRMED' : 'APPOINTMENT_REJECTED',
    p_target_type: 'appointment',
    p_target_id: appointmentId,
    p_metadata: { before, after: { status: newStatus } },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/employee/appointments?success=updated')
}

// ─── CEO OVERRIDE APPOINTMENT ────────────────────────────────────────────────
export async function ceoOverrideAppointment(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin','ceo'].includes(profile.role)) redirect('/403')

  const appointmentId = formData.get('appointmentId')
  const newStatus = formData.get('status')

  const { data: before } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single()

  await supabase
    .from('appointments')
    .update({
      status: newStatus,
      overridden_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: profile.role,
    p_action: 'APPOINTMENT_OVERRIDDEN',
    p_target_type: 'appointment',
    p_target_id: appointmentId,
    p_metadata: { before, after: { status: newStatus, overridden_by: user.id } },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/admin/appointments?success=overridden')
}

// ─── CANCEL APPOINTMENT (patient — 2hr rule) ──────────────────────────────────
export async function cancelAppointment(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const appointmentId = formData.get('appointmentId')

  const { data: appt } = await supabase
    .from('appointments')
    .select('patient_id, scheduled_at, status')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.patient_id !== user.id) redirect('/403')

  if (['completed', 'rejected', 'overridden', 'cancelled'].includes(appt.status)) {
    redirect('/patient/appointments?error=already_processed')
  }

  // Enforce 2-hour cancellation window
  const scheduledTime = new Date(appt.scheduled_at).getTime()
  const now = Date.now()
  const twoHours = 2 * 60 * 60 * 1000
  if (scheduledTime - now < twoHours) {
    redirect('/patient/appointments?error=too_late_to_cancel')
  }

  await supabase
    .from('appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', appointmentId)

  redirect('/patient/appointments?success=cancelled')
}
