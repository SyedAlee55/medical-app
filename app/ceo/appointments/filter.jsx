'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function AppointmentsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = searchParams.get('status') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''

  function updateParams(key, value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push('?' + params.toString())
  }

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6 text-sm">
      <select 
        value={status} 
        onChange={(e) => updateParams('status', e.target.value)}
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
        <option value="overridden">Overridden</option>
      </select>

      <div className="flex items-center gap-2">
        <label className="text-zinc-500">From:</label>
        <input 
          type="date" 
          value={from}
          onChange={(e) => updateParams('from', e.target.value)}
          className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-zinc-500">To:</label>
        <input 
          type="date" 
          value={to}
          onChange={(e) => updateParams('to', e.target.value)}
          className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 rounded"
        />
      </div>
    </div>
  )
}
