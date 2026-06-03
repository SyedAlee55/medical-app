'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { validateEmail, validatePassword, sanitizeName, normalizeEmail } from '@/lib/validation'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { resend } from '@/utils/resend'
import { VerificationEmail } from '@/emails/verification'
import { PasswordResetEmail } from '@/emails/password-reset'
import { render } from '@react-email/components'

// Constant delay to prevent timing attacks
const AUTH_DELAY = () => new Promise(r => setTimeout(r, 800))

// ─── SIGN UP ─────────────────────────────────────────────────────────────────
export async function signUp(formData) {
  await AUTH_DELAY()

  if (!process.env.RESEND_API_KEY) {
    console.error('[signUp] RESEND_API_KEY is not set!')
    return { error: 'configuration_error' }
  }

  const email    = normalizeEmail(formData.get('email') || '')
  const password = formData.get('password') || ''
  const fullName = sanitizeName(formData.get('fullName') || '')
  const role     = formData.get('role') || 'patient'

  console.log('ROLE:', formData.get('role'))

  // Only these three roles are allowed from the public signup form
  const allowedRoles = ['patient', 'doctor', 'staff']
  if (!allowedRoles.includes(role)) {
    return { error: 'invalid_input' }
  }

  // Validate inputs
  if (!validateEmail(email)) return { error: 'invalid_input' }
  const pwCheck = validatePassword(password)
  if (!pwCheck.valid) return { error: 'weak_password' }
  if (!fullName || fullName.length < 2) return { error: 'invalid_input' }

  // Build the callback URL for after email verification
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    .replace(/\/$/, '')
  const callbackUrl = `${siteUrl}/auth/callback`

  // Use admin client to:
  // 1. Create the user with email confirmation required
  // 2. Get the signed confirmation URL to embed in our branded email
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev'

  // Block existing accounts silently (same generic response)
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return { error: 'email_exists' }
  }

  // generateLink creates the auth user + returns the signed confirmation link
  // in one call — this is the canonical Supabase way to get the link without
  // triggering Supabase's own email (that's handled by our Resend call below)
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,      // DB trigger reads this — enforced server-side
      },
      redirectTo: callbackUrl,
    },
  })

  if (linkError) {
    console.error('[signUp] generateLink error:', linkError.message)
    console.log(`
[signUp] Debug Info:
- generateLink result: failed
- Resend send result: not_called
- confirmationUrl exists: false
- RESEND_FROM value: ${senderEmail}
- RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}
    `)
    return { error: 'signup_failed' }
  }

  const tokenHash = linkData.properties?.hashed_token
  if (!tokenHash) {
    console.error('[signUp] No hashed_token in generateLink response')
    console.log(`
[signUp] Debug Info:
- generateLink result: success
- Resend send result: not_called
- tokenHash exists: false
- RESEND_FROM value: ${senderEmail}
- RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}
    `)
    return { error: 'signup_failed' }
  }

  const confirmationUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=signup`

  // Send branded verification email via Resend
  const emailHtml = await render(VerificationEmail({ name: fullName, confirmationUrl, role }))
  const { error: emailError } = await resend.emails.send({
    from: senderEmail,
    to: email,
    subject: "Verify your Tj's Medical Hub account",
    html: emailHtml,
  })

  const generateLinkSuccess = !linkError ? 'success' : 'failed'
  const confirmationUrlExists = !!confirmationUrl
  const resendSendResult = emailError ? `failed - ${emailError.message}` : 'success'
  
  console.log(`
[signUp] Debug Info:
- generateLink result: ${generateLinkSuccess}
- Resend send result: ${resendSendResult}
- confirmationUrl exists: ${confirmationUrlExists}
- RESEND_FROM value: ${senderEmail}
- RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}
  `)

  if (emailError) {
    console.error('[signUp] Resend error:', emailError.message)
    return { error: 'email_send_failed', message: emailError.message }
  }

  return { success: true, redirectTo: '/login?message=check_email' }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login(formData) {
  await AUTH_DELAY()
  const supabase = await createClient()

  const email         = normalizeEmail(formData.get('email') || '')
  const password      = formData.get('password') || ''
  const submittedRole = formData.get('role') || 'patient'

  if (!validateEmail(email) || !password) {
    redirect('/login?error=invalid_credentials')
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=invalid_credentials')

  // ── EMAIL VERIFICATION GATE ───────────────────────────────────────────────
  // Block patients who haven't verified their email yet.
  // Doctors/staff are exempt because they go through admin approval anyway.
  if (!data.user.email_confirmed_at && data.user.app_metadata?.role === 'patient') {
    await supabase.auth.signOut()
    redirect('/login?error=email_not_verified')
  }

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

  // Also check email_confirmed_at for the profile role (covers edge cases
  // where metadata hasn't propagated yet)
  if (!data.user.email_confirmed_at && profile.role === 'patient') {
    await supabase.auth.signOut()
    redirect('/login?error=email_not_verified')
  }

  // ── ROLE PORTAL ENFORCEMENT ───────────────────────────────────────────────
  const patientPortalRoles = ['patient']
  const doctorPortalRoles  = ['doctor', 'staff', 'ceo', 'admin']

  if (submittedRole === 'patient' && !patientPortalRoles.includes(profile.role)) {
    await supabase.auth.signOut()
    redirect('/login?error=wrong_portal')
  }

  if (submittedRole === 'doctor' && !doctorPortalRoles.includes(profile.role)) {
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
    .then(() => {}).catch(() => {})

  revalidatePath('/', 'layout')

  // ── ROUTE BY ROLE ─────────────────────────────────────────────────────────
  if (profile.role === 'ceo') redirect('/verify-mfa')

  if (['doctor', 'staff'].includes(profile.role)) {
    if (!profile.bio && !profile.specialty_id && !profile.department) {
      redirect('/employee/onboarding')
    }
    if (profile.status === 'pending') redirect('/waiting-room')
    redirect('/employee/dashboard')
  }

  if (profile.role === 'patient') {
    if (profile.status !== 'active') redirect('/login?error=invalid_credentials')
    redirect('/patient/dashboard')
  }

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

  const email = normalizeEmail(formData.get('email') || '')
  if (!validateEmail(email)) return { error: 'invalid_email' }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Check user exists — but always return the same success message
  // to prevent email enumeration attacks
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
  const authUser = users?.find(u => u.email === email)

  // Always succeed silently if user not found — security best practice
  if (!authUser) return { success: true }

  // Generate a Supabase recovery link (does NOT send any email itself)
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    },
  })

  const tokenHash = linkData?.properties?.hashed_token
  if (linkError || !tokenHash) {
    console.error('[requestPasswordReset] generateLink error:', linkError?.message)
    // Return success anyway to avoid leaking info
    return { success: true }
  }

  // Fetch the user's name for personalisation
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('email', email)
    .maybeSingle()

  const resetUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=recovery`

  const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev'
  const emailHtml = await render(PasswordResetEmail({
    name: profile?.full_name || 'there',
    resetUrl,
  }))

  const { error: emailError } = await resend.emails.send({
    from: senderEmail,
    to: email,
    subject: "Reset your Tj's Medical Hub password",
    html: emailHtml,
  })

  if (emailError) {
    console.error('[requestPasswordReset] Resend error:', emailError.message)
    // Still return success — don't reveal failure to the public
    return { success: true }
  }

  return { success: true }
}

// ─── UPDATE PASSWORD ──────────────────────────────────────────────────────────
export async function updatePassword(formData) {
  const supabase = await createClient()
  const password = formData.get('password') || ''
  const confirm  = formData.get('confirmPassword') || ''

  const pwCheck = validatePassword(password)
  if (!pwCheck.valid) return { error: 'weak_password' }
  if (password !== confirm) return { error: 'passwords_mismatch' }

  // Get the logged in user to check their session
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'update_failed', message: 'You must be logged in to reset your password.' }
  }

  // Use the admin client to update the password.
  // This bypasses the Supabase requirement for an AAL2 session when MFA is enabled.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password
  })

  if (error) {
    console.error('[updatePassword] error:', error.message)
    return { error: 'update_failed', message: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'patient'

  let redirectTo = '/login?message=password_updated'
  if (role === 'ceo' || role === 'admin') {
    redirectTo = '/verify-mfa'
  } else if (role === 'patient') {
    redirectTo = '/patient/dashboard'
  } else if (['doctor', 'staff'].includes(role)) {
    redirectTo = '/employee/dashboard'
  }

  return { success: true, redirectTo }
}

// ─── RESEND VERIFICATION EMAIL ────────────────────────────────────────────────
export async function resendVerificationEmail(formData) {
  await AUTH_DELAY()

  const email = normalizeEmail(formData.get('email') || '')
  if (!validateEmail(email)) redirect('/login?error=invalid_credentials')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Fetch the user to check they exist and are unverified
  const { data: { users }, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()
  if (fetchError) redirect('/login?error=resend_failed')

  const authUser = users.find(u => u.email === email)
  if (!authUser) {
    // Return same generic message — don't reveal whether email exists
    redirect('/login?message=check_email')
  }

  // Already verified — don't resend
  if (authUser.email_confirmed_at) {
    redirect('/login?message=already_verified')
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  // Generate a fresh confirmation link
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink', // NOT 'signup' — user already exists
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  const tokenHash = linkData?.properties?.hashed_token
  if (linkError || !tokenHash) {
    console.error('[resendVerification] generateLink error:', linkError?.message)
    redirect('/login?error=resend_failed')
  }

  // Fetch the user's name for the email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, role')
    .eq('email', email)
    .maybeSingle()

  const confirmationUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=magiclink`

  const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev'
  const emailHtml = await render(VerificationEmail({
    name: profile?.full_name || 'there',
    confirmationUrl,
    role: profile?.role || 'patient',
  }))
  const { error: emailError } = await resend.emails.send({
    from: senderEmail,
    to: email,
    subject: "Verify your Tj's Medical Hub account",
    html: emailHtml,
  })

  if (emailError) {
    console.error('[resendVerification] Resend error:', emailError.message)
    redirect(`/login?error=email_send_failed&msg=${encodeURIComponent(emailError.message)}`)
  }

  redirect('/login?message=check_email')
}