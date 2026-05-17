'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function VerifyMfaPage() {
  const [factors, setFactors] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [code, setCode] = useState('')
  
  useEffect(() => {
    async function loadMfa() {
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.listFactors()
      
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Self-cleaning: if there is an unverified factor in 'all' list, unenroll it
      const unverified = data.all?.find(f => f.status === 'unverified')
      if (unverified) {
        await supabase.auth.mfa.unenroll({ factorId: unverified.id })
        
        // Re-fetch factors after deletion
        const { data: refetched, error: refetchError } = await supabase.auth.mfa.listFactors()
        if (!refetchError && refetched) {
          data.all = refetched.all
          data.totp = refetched.totp
        } else {
          data.all = []
          data.totp = []
        }
      }

      if (data.totp.length === 0) {
        // No factors enrolled -> enroll
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
        if (enrollError) {
          setError(enrollError.message)
        } else {
          setQrCode(enrollData.totp.qr_code)
          setFactors([enrollData])
        }
      } else {
        // Has factors
        setFactors(data.totp)
      }
      setLoading(false)
    }
    loadMfa()
  }, [])

  async function handleVerify(e) {
    e.preventDefault()
    const cleanedCode = code.trim()
    if (!cleanedCode || cleanedCode.length !== 6) {
      setError('Please enter a valid 6-digit code.')
      return
    }

    setVerifying(true)
    setError(null)

    const supabase = createClient()
    const factorId = factors?.[0]?.id

    if (!factorId) {
      setError('MFA Factor ID is missing. Please reload the page.')
      setVerifying(false)
      return
    }

    try {
      // 1. challenge and verify TOTP code client-side
      const { data, error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: cleanedCode
      })

      if (verifyError) {
        setError(verifyError.message || 'Invalid verification code. Please check your app.')
        setVerifying(false)
        return
      }

      // 2. Force token refresh to stamp 'aal2' claims immediately into cookies
      await supabase.auth.refreshSession()

      // 3. Navigate successfully
      window.location.href = '/admin/dashboard'
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading MFA configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6 text-center border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h1>
        <p className="text-slate-600 text-sm">Enter the 6-digit code from your authenticator app.</p>
        
        {qrCode && (
          <div className="flex flex-col items-center border border-slate-200 p-4 rounded-lg bg-slate-50 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scan to enroll:</p>
            <img src={qrCode} alt="QR Code" className="w-48 h-48 border border-white rounded shadow-sm bg-white" />
            <p className="text-xs text-slate-400">Scan this image using Google Authenticator or 1Password.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-lg text-xs font-medium border border-red-200 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input 
            type="text" 
            name="code" 
            placeholder="000000" 
            maxLength={6} 
            required 
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            disabled={verifying}
            className="w-full text-center text-3xl tracking-[0.4em] font-mono border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={verifying}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verifying code...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
