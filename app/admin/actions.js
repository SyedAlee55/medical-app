'use server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

function logAudit(supabase, payload) {
  supabase.rpc('log_audit_event', payload).catch(err =>
    console.error('Audit log failed:', err))
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

  // Kill all sessions globally using service role client
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  await adminSupabase.auth.admin.signOut(targetId, { scope: 'global' })

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
