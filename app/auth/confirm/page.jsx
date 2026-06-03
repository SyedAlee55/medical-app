'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token_hash || !type) {
      setStatus('error')
      setErrorMsg('Missing token or verification type.')
      return
    }

    const verify = async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        })

        if (error) {
          console.error('[auth/confirm] verification error:', error.message)
          setStatus('error')
          setErrorMsg(error.message)
          return
        }

        setStatus('success')
        
        // Redirect based on type
        setTimeout(() => {
          if (type === 'recovery') {
            router.push('/reset-password')
          } else {
            router.push('/login')
          }
        }, 1500)
      } catch (err) {
        console.error('[auth/confirm] unexpected error:', err)
        setStatus('error')
        setErrorMsg('An unexpected error occurred.')
      }
    }

    verify()
  }, [token_hash, type, router])

  return (
    <div className="w-full max-w-md bg-zinc-900/50 border border-white/15 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] hover:border-brand-500/25 transition-all duration-500 relative z-10 p-8 md:p-10 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center py-6">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Link</h2>
          <p className="text-zinc-400 text-sm">Please wait while we secure your session...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center py-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-400/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,148,162,0.15)]">
            <ShieldCheck className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Successful</h2>
          <p className="text-zinc-400 text-sm">You are verified. Redirecting you now...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center py-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-400/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
          <p className="text-red-300 text-sm leading-relaxed max-w-xs mb-8">
            {errorMsg || 'The verification link is invalid, expired, or has already been used.'}
          </p>
          <Link
            href="/login"
            className="w-full bg-brand-500/10 border border-brand-400/20 hover:bg-brand-500/20 text-white font-semibold rounded-xl py-3 text-sm transition cursor-pointer"
          >
            Return to login
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ConfirmPage() {
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

      <Suspense fallback={
        <div className="w-full max-w-md bg-zinc-900/50 border border-white/15 backdrop-blur-3xl rounded-3xl p-8 md:p-10 text-center relative z-10">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading</h2>
        </div>
      }>
        <ConfirmContent />
      </Suspense>
    </div>
  )
}
