'use client'

import { useState } from 'react'
import { approveDoctor, rejectDoctor } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

export function ApprovalActions({ targetId }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    const formData = new FormData()
    formData.append('targetId', targetId)
    await approveDoctor(formData)
    setLoading(false)
    router.refresh()
  }

  async function handleReject() {
    setLoading(true)
    const formData = new FormData()
    formData.append('targetId', targetId)
    await rejectDoctor(formData)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        disabled={loading} 
        onClick={handleApprove} 
        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 rounded text-xs font-medium"
      >
        Approve
      </button>
      <button 
        disabled={loading} 
        onClick={handleReject} 
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 rounded text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700"
      >
        Reject
      </button>
    </div>
  )
}
