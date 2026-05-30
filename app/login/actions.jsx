'use server'

import { createClient } from '@/utils/supabase/server'
import { validateEmail, validatePassword, sanitizeName, normalizeEmail } from '@/lib/validation'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Constant delay to prevent timing attacks
const AUTH_DELAY = () => new Promise(r => setTimeout(r, 800))

// ─── SIGN UP ─────────────────────────────────────────────────────────────────
export async function signUp(formData) {
  await AUTH_DELAY()
  const supabase = await createClient()

  const email = normalizeEmail(formData.get('email') || '')
  const password = formData.get('password') || ''
  const fullName = sanitizeName(formData.get('fullName') || '')
  const role = formData.get('role') || 'patient'

  console.log('ROLE:', formData.get('role'))

  // Only these three roles are allowed from the public signup form
  // admin and ceo cannot be self-assigned under any circumstance
  const allowedRoles = ['patient', 'doctor', 'staff']
  if (!allowedRoles.includes(role)) {
    redirect('/login?message=check_email')
  }

  // Validate inputs
  if (!validateEmail(email)) redirect('/login?message=check_email')
  const pwCheck = validatePassword(password)
  if (!pwCheck.valid) redirect('/login?error=weak_password')
  if (!fullName || fullName.length < 2) redirect('/login?error=invalid_input')

  // Block CEO email from public signup silently
  // Return the same generic response — never reveal why it was blocked
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile) {
    redirect('/login?message=check_email')
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role  // trigger reads this — DB enforces it, not the client
      }
    }
  })

  if (error) redirect('/login?message=check_email')

  // For doctors/staff: return a redirect target instead of calling redirect().
  // Calling redirect() throws immediately and can race with Supabase writing the
  // session cookie to the response — leaving the browser with no session.
  // Returning a plain object lets the action finish, cookies are committed first,
  // then the client navigates. Patients get the standard check-email flow.
  if (['doctor', 'staff'].includes(role) && signUpData?.user) {
    return { redirectTo: '/employee/onboarding' }
  }

  redirect('/login?message=check_email')
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login(formData) {
  await AUTH_DELAY()
  const supabase = await createClient()

  const email = normalizeEmail(formData.get('email') || '')
  const password = formData.get('password') || ''
  const submittedRole = formData.get('role') || 'patient' // comes from the hidden input in LoginClient

  if (!validateEmail(email) || !password) {
    redirect('/login?error=invalid_credentials')
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=invalid_credentials')

  // Fetch the real role from the database — this is the source of truth
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, mfa_enforced, bio, specialty_id, department')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login?error=invalid_credentials')
  }

  // ── ROLE PORTAL ENFORCEMENT ───────────────────────────────────────────────
  // The user selected a portal (patient or doctor) on the login form.
  // Their actual DB role must match that portal selection.
  // CEO logs in through the doctor/staff portal (submittedRole = 'doctor').
  // A patient trying to log in through the doctor portal is blocked.
  // A doctor trying to log in through the patient portal is blocked.

  const patientPortalRoles = ['patient']
  const doctorPortalRoles = ['doctor', 'staff', 'ceo', 'admin']

  if (submittedRole === 'patient' && !patientPortalRoles.includes(profile.role)) {
    // A doctor/staff/CEO tried to use the patient login portal
    await supabase.auth.signOut()
    redirect('/login?error=wrong_portal')
  }

  if (submittedRole === 'doctor' && !doctorPortalRoles.includes(profile.role)) {
    // A patient tried to use the doctor login portal
    await supabase.auth.signOut()
    redirect('/login?error=wrong_portal')
  }

  // ── ACCOUNT STATUS BLOCKS ─────────────────────────────────────────────────
  if (profile.status === 'suspended') {
    await supabase.auth.signOut()
    redirect('/suspended')
  }
  if (profile.status === 'rejected') {
    await supabase.auth.signOut()
    redirect('/rejected')
  }

  // ── UPDATE LAST LOGIN — non-blocking ──────────────────────────────────────
  supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id)
    .then(() => { }).catch(() => { })

  revalidatePath('/', 'layout')

  // ── ROUTE BY ROLE ─────────────────────────────────────────────────────────
  // CEO always goes to MFA first
  if (profile.role === 'ceo') redirect('/verify-mfa')

  // Doctor/staff who haven't filled their profile go to onboarding
  if (['doctor', 'staff'].includes(profile.role)) {
    if (!profile.bio && !profile.specialty_id && !profile.department) {
      redirect('/employee/onboarding')
    }
    if (profile.status === 'pending') redirect('/waiting-room')
    redirect('/employee/dashboard')
  }

  // Patient who hasn't filled their profile goes to onboarding
  if (profile.role === 'patient') {
    if (profile.status !== 'active') redirect('/login?error=invalid_credentials')
    redirect('/patient/dashboard')
  }

  // Admin goes to admin dashboard
  if (profile.role === 'admin') {
    redirect('/admin/dashboard')
  }

  redirect('/login')
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' })
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─── PASSWORD RESET REQUEST ───────────────────────────────────────────────────
export async function requestPasswordReset(formData) {
  await AUTH_DELAY()
  const supabase = await createClient()
  const email = normalizeEmail(formData.get('email') || '')

  if (!validateEmail(email)) redirect('/reset?message=check_email')

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
  })

  redirect('/reset?message=check_email')
}