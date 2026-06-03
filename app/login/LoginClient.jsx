'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, signUp } from './actions'
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, Lock } from 'lucide-react'
import { validateEmail, validatePassword } from '@/lib/validation'

export default function LoginClient({ errorMessage, infoMessage, errorMsgDetail }) {
  const [activeRole, setActiveRole] = useState('patient') // Default to patient for seamless UX
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()
  const loading = isPending

  const [localError, setLocalError] = useState(errorMessage)
  const [localInfo, setLocalInfo] = useState(infoMessage)
  const [localErrorDetail, setLocalErrorDetail] = useState(errorMsgDetail)

  useEffect(() => {
    setLocalError(errorMessage)
  }, [errorMessage])

  useEffect(() => {
    setLocalInfo(infoMessage)
  }, [infoMessage])

  useEffect(() => {
    setLocalErrorDetail(errorMsgDetail)
  }, [errorMsgDetail])



  const errorMap = {
    invalid_credentials:  'Incorrect email or password.',
    wrong_portal:         'This account does not have access to this portal. Please select the correct login option.',
    weak_password:        'Password must be at least 12 characters with uppercase, number and symbol.',
    invalid_input:        'Please check your details and try again.',
    too_many_attempts:    'Too many attempts. Please wait and try again.',
    email_not_verified:   'Please verify your email before logging in.',
    link_expired:         'Your verification link has expired. Please request a new one below.',
    invalid_link:         'This verification link is invalid or has already been used.',
    resend_failed:        'Could not resend the verification email. Please try again shortly.',
    email_send_failed:    'We registered your account but could not send the verification email.',
  }



  const router = useRouter()

  const handleLogin = (formData) => {
    setError(null)
    setLocalError(null)
    setLocalInfo(null)
    setLocalErrorDetail(null)

    const email = formData.get('email') || ''
    const password = formData.get('password') || ''

    if (!validateEmail(email)) {
      setError('Incorrect email or password.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    startTransition(async () => {
      try {
        await login(formData)
      } catch (err) {
        if (err && err.digest && err.digest.startsWith('NEXT_REDIRECT')) {
          throw err
        }
      }
    })
  }

  const handleSignUp = (formData) => {
    setError(null)
    setLocalError(null)
    setLocalInfo(null)
    setLocalErrorDetail(null)

    const fullName = formData.get('fullName') || ''
    const email = formData.get('email') || ''
    const password = formData.get('password') || ''

    if (!fullName || fullName.trim().length < 2) {
      setError('Please check your details and try again. Name is too short.')
      return
    }

    if (!validateEmail(email)) {
      setError('Please check your details and try again. Invalid email format.')
      return
    }

    const pwCheck = validatePassword(password)
    if (!pwCheck.valid) {
      setError(`Password requirement not met: ${pwCheck.reason}`)
      return
    }

    startTransition(async () => {
      try {
        const result = await signUp(formData)
        
        if (result?.error) {
          // Map error codes to user-facing messages
          const errorMessages = {
            'email_exists': 'An account with this email already exists.',
            'email_send_failed': 'We could not send the verification email. Please try again.',
            'invalid_input': 'Please check your name and email.',
            'weak_password': 'Password must be at least 12 characters.',
            'configuration_error': 'Service temporarily unavailable.',
            'signup_failed': 'Could not create account. Please try again.',
          }
          setError(errorMessages[result.error] || 'Something went wrong.')
          return
        }
        
        if (result?.redirectTo) {
          setError(null)
          setLocalError(null)
          setLocalInfo('check_email')
          setLocalErrorDetail(null)
          setMode('login')
          router.push(result.redirectTo)
          return
        }
      } catch (err) {
        if (err && err.digest && err.digest.startsWith('NEXT_REDIRECT')) {
          throw err
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background medical image + gradient overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 pointer-events-none"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/98 via-zinc-950/88 to-zinc-900/80" />
      </div>

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Center Glassmorphic Card Container */}
      <div className="w-full max-w-5xl bg-zinc-900/50 border border-white/15 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] hover:border-brand-500/25 transition-all duration-500 flex flex-col md:flex-row relative z-10 min-h-[600px]">
        {/* Sliding linear progress bar at the top */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-500/10 overflow-hidden z-50">
            <div className="absolute top-0 bottom-0 left-0 bg-brand-500 animate-progress-linear" />
          </div>
        )}
        
        {/* Left Section: Testimonial (Desktop/Tablet only) */}
        <div className="hidden md:flex md:w-[40%] lg:w-[45%] p-12 bg-white/[0.01] border-r border-white/5 flex-col justify-between relative overflow-hidden">
          {/* Top: Brand Logo */}
          <div className="relative z-10">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300 font-bold shadow-[0_0_15px_rgba(6,148,162,0.25)]">
                <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2h4v10h10v4h-10v10h-4v-10H2v-4h10V2z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Tj&apos;s Medical Hub</span>
            </a>
          </div>

          {/* Center: Testimonial (Minimalist & Typographic) */}
          <div className="relative z-10 my-auto max-w-md space-y-4">
            <span className="text-6xl font-serif text-brand-400/30 select-none block leading-none -mb-6">&ldquo;</span>
            <p className="text-lg font-medium italic leading-relaxed text-zinc-200">
              Tj&apos;s Medical Hub transformed how I connect with healthcare professionals. It&apos;s the infrastructure modern medicine deserves.
            </p>
            <div className="flex items-center gap-3 pt-3">
              <div>
                <p className="font-semibold text-white text-sm">Dr. Kamran Yousaf</p>
                <p className="text-zinc-500 text-xs">Satisfied Patient</p>
              </div>
            </div>
          </div>

          {/* Bottom: Verification badges */}
          <div className="relative z-10 flex items-center gap-6 text-zinc-400 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-450" />
              <span>Fully Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-450" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                        setLocalError(null);
                        setLocalInfo(null);
                        setLocalErrorDetail(null);
                      }}
                      className="text-brand-300 hover:text-brand-200 font-semibold cursor-pointer underline underline-offset-4"
                    >
                      Sign up &rarr;
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        setMode('login');
                        setError(null);
                        setLocalError(null);
                        setLocalInfo(null);
                        setLocalErrorDetail(null);
                      }}
                      className="text-brand-300 hover:text-brand-200 font-semibold cursor-pointer underline underline-offset-4"
                    >
                      Log in &rarr;
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Role selector tabs */}
            <div className="bg-white/5 border border-white/8 rounded-xl p-1 flex gap-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveRole('patient');
                  setError(null);
                  setLocalError(null);
                  setLocalInfo(null);
                  setLocalErrorDetail(null);
                }}
                className={`flex-1 text-center font-semibold text-sm py-2 rounded-lg transition-all cursor-pointer ${
                  activeRole === 'patient'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-400/30 shadow-[0_0_15px_rgba(6,148,162,0.15)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('doctor');
                  setError(null);
                  setLocalError(null);
                  setLocalInfo(null);
                  setLocalErrorDetail(null);
                }}
                className={`flex-1 text-center font-semibold text-sm py-2 rounded-lg transition-all cursor-pointer ${
                  activeRole === 'doctor'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-400/30 shadow-[0_0_15px_rgba(6,148,162,0.15)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Doctor / Staff
              </button>
            </div>

            {/* Error Banner */}
            {localError && (
              <div className="mb-6 bg-red-500/5 backdrop-blur-xl border border-red-500/15 rounded-lg px-4 py-3 text-sm text-red-300 flex flex-col items-start gap-2 animate-fade-in shadow-[0_4px_20px_rgba(239,68,68,0.02)]">
                <div className="flex items-center gap-2.5 w-full">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <span>{errorMap[localError] || localError}</span>
                </div>
                {localError === 'email_send_failed' && localErrorDetail && (
                  <p className="text-xs text-red-450 mt-1 pl-7.5 font-medium leading-relaxed break-words w-full border-t border-red-500/10 pt-2">
                    <strong className="block text-[10px] uppercase tracking-wider text-red-400 mb-0.5">Resend API Response:</strong>
                    {decodeURIComponent(localErrorDetail)}
                  </p>
                )}
              </div>
            )}

            {/* Info Banner */}
            {(localInfo === 'check_email' || localInfo === 'already_verified' || localInfo === 'password_updated') && (
              <div className="mb-6 bg-brand-500/5 backdrop-blur-xl border border-brand-500/15 rounded-lg px-4 py-3 text-sm text-brand-300 flex items-center gap-2.5 animate-fade-in shadow-[0_4px_20px_rgba(6,148,162,0.02)]">
                <ShieldCheck className="w-5 h-5 shrink-0 text-brand-400" />
                <span>
                  {localInfo === 'already_verified'
                    ? 'Your email is already verified — you can log in now.'
                    : localInfo === 'password_updated'
                    ? 'Your password has been updated. You can now log in with your new password.'
                    : 'Check your inbox for a verification link. It expires in 24 hours.'}
                </span>
              </div>
            )}



            {/* Form */}
            {mode === 'login' ? (
              <form action={handleLogin} className="flex flex-col gap-5">
                <input type="hidden" name="role" value={activeRole} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Email address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Password</label>
                    <a href="/forgot-password" className="text-xs text-brand-300 hover:text-brand-200 font-medium">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Log in as {activeRole === 'patient' ? 'Patient' : 'Doctor / Staff'}</span>
                  )}
                </button>
                {error && (
                  <p className="text-red-400 text-sm text-center mt-2">{error}</p>
                )}
              </form>
            ) : (
              <form action={handleSignUp} className="flex flex-col gap-5">
                <input type="hidden" name="role" value={activeRole} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Full name</label>
                  <input
                    name="fullName"
                    type="text"
                    placeholder={activeRole === 'doctor' ? 'Dr. John Smith' : 'Jane Smith'}
                    required
                    className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Email address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 12 characters"
                      required
                      className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {activeRole === 'doctor' && (
                  <div className="text-xs text-brand-300 bg-brand-500/10 border border-brand-400/25 rounded-lg px-3.5 py-3 flex gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-brand-450 mt-0.5" />
                    <span>
                      Doctor and staff accounts require administrator approval before access is granted. You will be notified by email.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>{activeRole === 'doctor' ? 'Submit application' : 'Create patient account'}</span>
                  )}
                </button>
                {error && (
                  <p className="text-red-400 text-sm text-center mt-2">{error}</p>
                )}
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
