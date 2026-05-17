'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getDashboardStats() {
  const supabase = await createClient()

  // 1. Get logged-in user and enforce CEO guard
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

  // 2. Query statistics in parallel
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
