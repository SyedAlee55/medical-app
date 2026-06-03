'use client'

import { useState, useTransition } from 'react'
import { requestPasswordReset } from '@/app/login/actions'
import { AlertCircle, ArrowLeft, Mail, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (formData) => {
    setError(null)
    startTransition(async () => {
      const result = await requestPasswordReset(formData)
      if (result?.error === 'invalid_email') {
        setError('Please enter a valid email address.')
        return
      }
      // Always show success — never leak whether email exists
      setSubmitted(true)
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 pointer-events-none"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/98 via-zinc-950/88 to-zinc-900/80" />
      </div>

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-zinc-900/50 border border-white/15 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] hover:border-brand-500/25 transition-all duration-500 relative z-10">
        {/* Progress bar while pending */}
        {isPending && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-500/10 overflow-hidden z-50">
            <div className="absolute top-0 bottom-0 left-0 bg-brand-500 animate-progress-linear" />
          </div>
        )}

        <div className="p-8 md:p-10">
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-medium mb-8 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to login
          </Link>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-400/20 flex items-center justify-center mb-5">
                  <Mail className="w-6 h-6 text-brand-400" />
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Forgot password?</h1>
                <p className="text-sm text-zinc-400 mt-2">
                  Enter your account email and we&apos;ll send you a reset link.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3 text-sm text-red-300 flex items-center gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form action={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                  />
                </div>

                <button
                  type="submit"
                  id="forgot-password-submit"
                  disabled={isPending}
                  className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <span>Send reset link</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center text-center py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-400/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,148,162,0.1)]">
                <ShieldCheck className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                If an account exists for that email, you&apos;ll receive a password reset link within a minute.
              </p>
              <p className="text-zinc-500 text-xs mt-4">
                Didn&apos;t get it? Check your spam folder.
              </p>
              <Link
                href="/login"
                className="mt-8 text-sm font-semibold text-brand-300 hover:text-brand-200 transition-colors underline underline-offset-4"
              >
                Return to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
