'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function LogsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const action = searchParams.get('action') || ''
  const role = searchParams.get('role') || ''

  function updateParams(key, value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    // reset page to 1 on filter change
    params.delete('page')
    router.push('?' + params.toString())
  }

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6 text-sm">
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

      <input 
        type="text" 
        placeholder="Action type..." 
        value={action}
        onChange={(e) => updateParams('action', e.target.value)}
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 rounded"
      />

      <select 
        value={role} 
        onChange={(e) => updateParams('role', e.target.value)}
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 rounded"
      >
        <option value="">All Roles</option>
        <option value="ceo">CEO</option>
        <option value="admin">Admin</option>
        <option value="doctor">Doctor</option>
        <option value="staff">Staff</option>
        <option value="patient">Patient</option>
        <option value="unauthenticated">Unauthenticated</option>
      </select>
    </div>
  )
}
