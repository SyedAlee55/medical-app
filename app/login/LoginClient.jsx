'use client'

import { useState } from 'react'
import { login, signUp } from './actions'
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, Lock } from 'lucide-react'

export default function LoginClient({ errorMessage, infoMessage }) {
  const [activeRole, setActiveRole] = useState('patient') // Default to patient for seamless UX
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const errorMap = {
    invalid_credentials: 'Incorrect email or password.',
    wrong_portal: 'This account does not have access to this portal. Please select the correct login option.',
    weak_password: 'Password must be at least 12 characters with uppercase, number and symbol.',
    invalid_input: 'Please check your details and try again.',
    too_many_attempts: 'Too many attempts. Please wait and try again.',
  }

  const handleFormSubmit = () => {
    setLoading(true)
    // Clear loading if there's a timeout or page reload
    setTimeout(() => setLoading(false), 5000)
  }

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-600 font-bold">
              <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2h4v10h10v4h-10v10h-4v-10H2v-4h10V2z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Tj&apos;s Medical Hub</span>
          </a>
        </div>

        {/* Center: Quote */}
        <div className="relative z-10 my-auto max-w-md">
          <p className="text-xl font-medium italic leading-relaxed text-brand-50">
            &ldquo;Tj&apos;s Medical Hub transformed how I connect with patients. It&apos;s the infrastructure modern medicine deserves.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">AR</div>
            <div>
              <p className="font-semibold text-white text-sm">Dr. Aisha Rehman</p>
              <p className="text-brand-200 text-xs">Primary Care Physician</p>
            </div>
          </div>
        </div>

        {/* Bottom: Verification badges */}
        <div className="relative z-10 flex items-center gap-6 text-brand-200 text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-300" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-brand-300" />
            <span>SSL Secured</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="type-h2 text-zinc-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="type-body text-sm mt-2">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); errorMessage = null; }}
                    className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer underline underline-offset-4"
                  >
                    Sign up &rarr;
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('login'); errorMessage = null; }}
                    className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer underline underline-offset-4"
                  >
                    Log in &rarr;
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="bg-zinc-100 rounded-xl p-1 flex gap-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveRole('patient')}
              className={`flex-1 text-center font-medium text-sm py-2 rounded-lg transition-all cursor-pointer ${
                activeRole === 'patient'
                  ? 'bg-white shadow-sm text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('doctor')}
              className={`flex-1 text-center font-medium text-sm py-2 rounded-lg transition-all cursor-pointer ${
                activeRole === 'doctor'
                  ? 'bg-white shadow-sm text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Doctor / Staff
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMap[errorMessage] || errorMessage}</span>
            </div>
          )}

          {/* Info Banner */}
          {infoMessage === 'check_email' && (
            <div className="mb-6 bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-sm text-brand-700 flex items-center gap-2.5 animate-fade-in">
              <ShieldCheck className="w-5 h-5 shrink-0 text-brand-600" />
              <span>Check your email to confirm your account before logging in.</span>
            </div>
          )}

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              <input type="hidden" name="role" value={activeRole} />

              <div className="flex flex-col gap-1.5">
                <label className="type-label mb-1.5">Email address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="type-label mb-1.5">Password</label>
                  <a href="#" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-zinc-200 pl-3.5 pr-10 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                formAction={login}
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-3 text-base transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(6,148,162,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
            </form>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              <input type="hidden" name="role" value={activeRole} />

              <div className="flex flex-col gap-1.5">
                <label className="type-label mb-1.5">Full name</label>
                <input
                  name="fullName"
                  type="text"
                  placeholder={activeRole === 'doctor' ? 'Dr. John Smith' : 'Jane Smith'}
                  required
                  className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="type-label mb-1.5">Email address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="type-label mb-1.5">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 12 characters"
                    required
                    className="w-full rounded-lg border border-zinc-200 pl-3.5 pr-10 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {activeRole === 'doctor' && (
                <div className="text-xs text-brand-800 bg-brand-50 border border-brand-100 rounded-lg px-3.5 py-3 flex gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-brand-600 mt-0.5" />
                  <span>
                    Doctor and staff accounts require administrator approval before access is granted. You will be notified by email.
                  </span>
                </div>
              )}

              <button
                type="submit"
                formAction={signUp}
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-3 text-base transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(6,148,162,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
