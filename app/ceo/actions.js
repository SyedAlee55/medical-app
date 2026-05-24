'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

async function logAudit(supabase, payload) {
  try {
    await supabase.rpc('log_audit_event', payload)
  } catch (err) {
    console.error('Audit log failed:', err)
  }
}

async function requireCeo(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'ceo') {
    redirect('/403')
  }
  return { user, profile }
}

export async function getDashboardStats() {
  const supabase = await createClient()
  await requireCeo(supabase)

  // Query statistics in parallel
  const [
    { count: totalDoctors },
    { count: totalPatients },
    { count: pendingApprovals },
    { count: totalAppointments },
    { count: pendingAppointments },
    { data: recentLogs }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending').in('role', ['doctor', 'staff']),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null),
    supabase.from('audit_logs').select('created_at, actor_role, action').order('created_at', { ascending: false }).limit(5)
  ])

  return {
    totalDoctors: totalDoctors ?? 0,
    totalPatients: totalPatients ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    totalAppointments: totalAppointments ?? 0,
    pendingAppointments: pendingAppointments ?? 0,
    recentLogs: recentLogs || []
  }
}

export async function getAllUsers(filters = {}) {
  const supabase = await createClient()
  await requireCeo(supabase)

  let query = supabase
    .from('profiles')
    .select('*, specialties(name)')

  if (filters.role) {
    query = query.eq('role', filters.role)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (!filters.includeDeleted) {
    query = query.is('deleted_at', null)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) {
    console.error('getAllUsers failed:', error)
    return { data: [], error }
  }
  return { data, error: null }
}

export async function updateUserProfile(formData) {
  const supabase = await createClient()
  const { user } = await requireCeo(supabase)

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
    redirect(`/ceo/users/${targetId}/edit?error=update_failed`)
  }

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: 'ceo',
    p_action: 'USER_PROFILE_UPDATED_BY_CEO',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { updated_fields: { full_name, email, phone, department, specialty_id, employee_id } },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/ceo/users?success=updated')
}

export async function killSwitch(formData) {
  const supabase = await createClient()
  const { user } = await requireCeo(supabase)
  const targetId = formData.get('userId')

  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetId)
    .single()
  if (!target || target.role === 'ceo') redirect('/403')

  const now = new Date().toISOString()
  await supabase
    .from('profiles')
    .update({
      kill_switched_at: now,
      kill_switched_by: user.id,
      status: 'suspended',
      updated_at: now
    })
    .eq('id', targetId)

  // Cancel any active future appointments for this user
  await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: now,
      cancellation_reason: 'Account terminated by CEO (Kill Switch)',
      updated_at: now
    })
    .or(`patient_id.eq.${targetId},doctor_id.eq.${targetId}`)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', now)

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: 'ceo',
    p_action: 'KILL_SWITCH_ACTIVATED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { target_role: target.role },
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/ceo/users?success=killed')
}

export async function verifyEmployeeId(formData) {
  const supabase = await createClient()
  const { user } = await requireCeo(supabase)
  
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
    p_actor_role: 'ceo',
    p_action: approved ? 'EMPLOYEE_ID_VERIFIED' : 'EMPLOYEE_ID_REJECTED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: {},
    p_ip_address: null,
    p_user_agent: null
  })

  redirect('/ceo/employee-ids?success=' + (approved ? 'verified' : 'rejected'))
}

export async function deleteUser(formData) {
  const supabase = await createClient()
  const { user } = await requireCeo(supabase)
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
    const redirectUrl = target.role === 'patient' 
      ? `/ceo/patients?error=has_active_appointments` 
      : `/ceo/users?error=has_active_appointments`
    redirect(redirectUrl)
  }

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { error } = await supabaseAdmin.auth.admin.deleteUser(targetId)
  if (error) {
    console.error('Delete user failed:', error)
    const redirectUrl = target.role === 'patient' 
      ? `/ceo/patients?error=delete_failed` 
      : `/ceo/users?error=delete_failed`
    redirect(redirectUrl)
  }

  logAudit(supabase, {
    p_actor_id: user.id,
    p_actor_role: 'ceo',
    p_action: 'USER_DELETED',
    p_target_type: 'profile',
    p_target_id: targetId,
    p_metadata: { target_role: target.role },
    p_ip_address: null,
    p_user_agent: null
  })

  const successUrl = target.role === 'patient' 
    ? `/ceo/patients?success=deleted` 
    : `/ceo/users?success=deleted`
  redirect(successUrl)
}

export async function exportActivityLogs(formData) {
  const supabase = await createClient()
  await requireCeo(supabase)

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
