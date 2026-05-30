import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// ── Route ownership map ───────────────────────────────────────────────────────
// Defines which roles are allowed on which route prefixes.
// If a role is not in the array for a prefix, they are redirected out.
const ROUTE_PERMISSIONS = {
  '/patient': ['patient', 'ceo'],
  '/employee': ['doctor', 'staff', 'ceo'],
  '/admin': ['admin', 'ceo'],
  '/ceo': ['ceo'],
  '/onboarding/patient': ['patient'],
  '/employee/onboarding': ['doctor', 'staff'],
  '/verify-mfa': ['ceo', 'admin'],
}

// Where each role goes after a successful login
const ROLE_HOME = {
  patient: '/patient/dashboard',
  doctor: '/employee/dashboard',
  staff: '/employee/dashboard',
  admin: '/verify-mfa',
  ceo: '/verify-mfa',
}

// Routes that anyone can visit — authenticated or not
const PUBLIC_ROUTES = [
  '/login',
  '/waiting-room',
  '/suspended',
  '/rejected',
  '/403',
  '/404',
  '/',
  '/schedule',
  '/about',
]

function isPublic(pathname) {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

function getRoleHome(role) {
  return ROLE_HOME[role] || '/login'
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // ── Security headers — applied to every single response ───────────────────
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https://*.supabase.co https://assets.calendly.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.calendly.com; style-src 'self' 'unsafe-inline' https://assets.calendly.com; frame-src 'self' https://calendly.com"
  )

  // ── Build Supabase client that reads/writes cookies ───────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          // Re-apply security headers after response rebuild
          response.headers.set('X-Frame-Options', 'DENY')
          response.headers.set('X-Content-Type-Options', 'nosniff')
          response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
          response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
          response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
          response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https://*.supabase.co https://assets.calendly.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.calendly.com; style-src 'self' 'unsafe-inline' https://assets.calendly.com; frame-src 'self' https://calendly.com"
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        }
      }
    }
  )

  // ── Get the verified user — getUser() hits Supabase Auth server ──────────
  // Never use getSession() here — it reads from cookie only and can be spoofed
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // ── GATE 1: Not authenticated ─────────────────────────────────────────────
  if (!user || authError) {
    if (isPublic(pathname)) return response // let them through to public pages
    // Everything else requires a login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // ── Fetch role and status from profiles table (Absolute Source of Truth) ───
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'patient'
  const defaultStatus = ['patient', 'ceo', 'admin'].includes(role) ? 'active' : 'pending'
  const status = profile?.status || defaultStatus

  // ── GATE 2: Authenticated user hitting login page ─────────────────────────
  // Send them to their correct portal — they don't need to log in again
  if (pathname.startsWith('/login')) {
    if (role === 'ceo') return NextResponse.redirect(new URL('/verify-mfa', request.url))
    if (status === 'pending') return NextResponse.redirect(new URL('/waiting-room', request.url))
    if (status === 'suspended') return NextResponse.redirect(new URL('/suspended', request.url))
    if (status === 'rejected') return NextResponse.redirect(new URL('/rejected', request.url))
    return NextResponse.redirect(new URL(getRoleHome(role), request.url))
  }

  // ── GATE 3: Account status blocks — checked before any route permission ───
  if (status === 'suspended' && !pathname.startsWith('/suspended')) {
    return NextResponse.redirect(new URL('/suspended', request.url))
  }
  if (status === 'rejected' && !pathname.startsWith('/rejected')) {
    return NextResponse.redirect(new URL('/rejected', request.url))
  }
  if (status === 'pending' && !pathname.startsWith('/waiting-room')) {
    // Pending users can only see their onboarding form or the waiting room
    if (pathname.startsWith('/employee/onboarding')) return response
    return NextResponse.redirect(new URL('/waiting-room', request.url))
  }

  // ── GATE 4: CEO must complete MFA before accessing anything ───────────────
  if (role === 'ceo' || role === 'admin') {
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const mfaLevel = mfaData?.currentLevel || 'aal1'
    if (mfaLevel !== 'aal2' && !pathname.startsWith('/verify-mfa')) {
      return NextResponse.redirect(new URL('/verify-mfa', request.url))
    }
  }

  // ── GATE 5: Route permission check ───────────────────────────────────────
  // Find which permission group this route falls under
  const matchedPrefix = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length) // longest prefix wins
    .find(prefix => pathname.startsWith(prefix))

  if (matchedPrefix) {
    const allowedRoles = ROUTE_PERMISSIONS[matchedPrefix]
    if (!allowedRoles.includes(role)) {
      // Log unauthorized access attempt — fire and forget
      supabase.rpc('log_audit_event', {
        p_actor_id: user.id,
        p_actor_role: role,
        p_action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        p_target_type: 'route',
        p_target_id: null,
        p_metadata: { attempted_path: pathname, user_role: role },
        p_ip_address: null,
        p_user_agent: null
      }).then(null, () => { })

      return NextResponse.redirect(new URL('/403', request.url))
    }
  }

  // ── GATE 6: Active patient hitting a non-patient protected route ──────────
  // Extra explicit check — belt and suspenders
  if (role === 'patient' && (pathname.startsWith('/employee') || pathname.startsWith('/admin') || pathname.startsWith('/ceo'))) {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  // ── All gates passed — allow the request through ──────────────────────────
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'
  ]
}
