/**

 * Shared helpers for admin/CEO user suspend and delete flows.

 */



export async function countBlockingAppointments(supabase, targetId) {

  const { count, error } = await supabase

    .from('appointments')

    .select('id', { count: 'exact', head: true })

    .or(`patient_id.eq.${targetId},doctor_id.eq.${targetId}`)

    .in('status', ['pending', 'confirmed'])

    .is('deleted_at', null)



  if (error) {

    console.error('countBlockingAppointments failed:', error)

    return 0

  }

  return count ?? 0

}



/** Cancel every pending/confirmed appointment for this user (patient or doctor). */

export async function cancelPendingAppointments(supabase, targetId, reason) {
export async function softDeleteProfile(supabaseAdmin, targetId, deletedBy) {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      deleted_at: now,
      deleted_by: deletedBy,
      status: 'suspended',
      updated_at: now,
    })
    .eq('id', targetId)
    .is('deleted_at', null)
    .select('id')
    .single()

  if (error || !data) {

  deleted_at: now,

  return { ok: true, error: null }

 * Marks a profile as deleted (soft delete). Row stays in DB for audit/appointments;

 * directory queries must filter `.is('deleted_at', null)`.

 */

export async function softDeleteProfile(supabase, targetId, deletedBy) {

  const now = new Date().toISOString()



  let { data, error } = await supabase

    .from('profiles')

    .update(SOFT_DELETE_PAYLOAD(now, deletedBy))

    .eq('id', targetId)

    .is('deleted_at', null)

    .select('id, deleted_at')

    .maybeSingle()



  // Missing deleted_by column (migration not applied)

  if (error?.code === '42703' || error?.message?.includes('deleted_by')) {

    const retry = await supabase

      .from('profiles')

      .update(SOFT_DELETE_PAYLOAD_MINIMAL(now))

      .eq('id', targetId)

      .is('deleted_at', null)

      .select('id, deleted_at')

      .maybeSingle()

    data = retry.data

    error = retry.error

  }



  if (error) {

    console.error('softDeleteProfile failed:', error)

    return { ok: false, error }

  }



  if (data?.deleted_at) {

    return { ok: true, error: null }

  }



  // 0 rows updated — already soft-deleted or id not found

  const { data: existing, error: readError } = await supabase

    .from('profiles')

    .select('id, deleted_at')

    .eq('id', targetId)

    .maybeSingle()



  if (readError) {

    console.error('softDeleteProfile verify read failed:', readError)

    return { ok: false, error: readError }

  }



  if (existing?.deleted_at) {

    return { ok: true, error: null, alreadyDeleted: true }

  }



  console.error('softDeleteProfile: no row updated for', targetId)

  return { ok: false, error: new Error('Profile was not updated') }

}



/** Build a Set of user IDs that still have pending/confirmed appointments. */

export async function getUsersWithBlockingAppointments(supabase, userIds) {

  const blocking = new Set()

  if (!userIds?.length) return blocking



  const { data, error } = await supabase

    .from('appointments')

    .select('patient_id, doctor_id')

    .in('status', ['pending', 'confirmed'])

    .is('deleted_at', null)



  if (error) {

    console.error('getUsersWithBlockingAppointments failed:', error)

    return blocking

  }



  const idSet = new Set(userIds)

  for (const row of data ?? []) {

    if (idSet.has(row.patient_id)) blocking.add(row.patient_id)

    if (idSet.has(row.doctor_id)) blocking.add(row.doctor_id)

  }

  return blocking

}

