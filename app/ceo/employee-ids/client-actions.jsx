'use client'

import { useState } from 'react'
import { verifyEmployeeId } from '@/app/ceo/actions'
import { useRouter } from 'next/navigation'

export function EmployeeIdActions({ targetId }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleVerify(approved) {
    setLoading(true)
    const formData = new FormData()
    formData.append('userId', targetId)
    formData.append('approved', approved ? 'true' : 'false')
    await verifyEmployeeId(formData)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        disabled={loading} 
        onClick={() => handleVerify(true)} 
        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1 rounded text-xs font-medium"
      >
        Approve ID
      </button>
      <button 
        disabled={loading} 
        onClick={() => handleVerify(false)} 
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 rounded text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700"
      >
        Reject ID
      </button>
    </div>
  )
}
