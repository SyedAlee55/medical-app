'use client'

import { useState } from 'react'
import { verifyEmployeeId } from '@/app/admin/actions'

export function EmployeeIdActions({ targetId, isVerified }) {
  const [loading, setLoading] = useState(false)

  async function handleAction(approved) {
    setLoading(true)
    const formData = new FormData()
    formData.append('userId', targetId)
    formData.append('approved', approved ? 'true' : 'false')
    await verifyEmployeeId(formData)
    setLoading(false)
  }

  // Already verified: only allow revocation (Reject)
  if (isVerified) {
    return (
      <button
        disabled={loading}
        onClick={() => handleAction(false)}
        className="border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 font-semibold rounded px-3 py-1.5 text-xs transition cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Revoking...' : 'Revoke'}
      </button>
    )
  }

  // Not yet verified: allow Approve or Reject
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={loading}
        onClick={() => handleAction(true)}
        className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded px-3 py-1.5 text-xs transition cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Approving...' : 'Approve'}
      </button>
      <button
        disabled={loading}
        onClick={() => handleAction(false)}
        className="border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold rounded px-3 py-1.5 text-xs transition cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  )
}
