import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  // Determine the site origin (works in both dev and prod)
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : requestUrl.origin

  if (!code) {
    // No code — something went wrong with the link
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=link_expired`)
  }

  // ── Recovery flow: user clicked the password reset email link ──────────────
  // The `next` param is set to /reset-password in requestPasswordReset.
  // Skip role routing entirely — send them to choose a new password.
  if (next === '/reset-password') {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  // Get the newly authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
  }

  // Fetch their profile to determine where to send them
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, bio, specialty_id, department')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
  }

  // Route by role
  if (profile.role === 'patient') {
    return NextResponse.redirect(`${origin}/patient/dashboard?verified=true`)
  }

  if (['doctor', 'staff'].includes(profile.role)) {
    const hasProfile = profile.bio || profile.specialty_id || profile.department
    if (!hasProfile) {
      return NextResponse.redirect(`${origin}/employee/onboarding`)
    }
    if (profile.status === 'pending') {
      return NextResponse.redirect(`${origin}/waiting-room`)
    }
    return NextResponse.redirect(`${origin}/employee/dashboard`)
  }

  if (profile.role === 'ceo') {
    return NextResponse.redirect(`${origin}/verify-mfa`)
  }

  if (profile.role === 'admin') {
    return NextResponse.redirect(`${origin}/admin/dashboard`)
  }

  // Fallback
  return NextResponse.redirect(`${origin}${next}`)
}
