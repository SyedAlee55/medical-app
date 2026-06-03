'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/app/login/actions'
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState(null)

  const errorMessages = {
    weak_password:       'Password must be at least 12 characters with an uppercase letter, number, and symbol.',
    passwords_mismatch:  'Passwords do not match. Please try again.',
    update_failed:       'Could not update your password. Your reset link may have expired — please request a new one.',
  }

  const handleSubmit = (formData) => {
    setError(null)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) {
        setError(result.message || errorMessages[result.error] || 'Something went wrong. Please try again.')
        return
      }
      if (result?.redirectTo) {
        router.push(result.redirectTo)
      }
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

        {/* Progress bar */}
        {isPending && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-500/10 overflow-hidden z-50">
            <div className="absolute top-0 bottom-0 left-0 bg-brand-500 animate-progress-linear" />
          </div>
        )}

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-400/20 flex items-center justify-center mb-5">
              <KeyRound className="w-6 h-6 text-brand-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Set new password</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Choose a strong password for your account.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3 text-sm text-red-300 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form action={handleSubmit} className="flex flex-col gap-5">

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 12 characters"
                  required
                  autoComplete="new-password"
                  className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Must be 12+ characters with uppercase, number and symbol.
              </p>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  className="w-full bg-zinc-900 border border-white/8 text-white placeholder-zinc-500 rounded-lg pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-zinc-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="reset-password-submit"
              disabled={isPending}
              className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Update password</span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
            Link expired?{' '}
            <Link href="/forgot-password" className="text-brand-300 hover:text-brand-200 font-semibold underline underline-offset-4 transition-colors">
              Request a new one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
