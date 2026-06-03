'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyMfa(formData) {
  const supabase = await createClient()
  const code = formData.get('code')?.trim()
  const factorId = formData.get('factorId')

  if (!code || !factorId) redirect('/verify-mfa?error=invalid')

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
  if (error) redirect('/verify-mfa?error=invalid')

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role === 'ceo' || profile?.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/admin/dashboard')
  }
}
