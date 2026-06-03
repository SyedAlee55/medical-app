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
        <label className="text-zinc-400 font-medium text-xs">From:</label>
        <input 
          type="date" 
          value={from}
          onChange={(e) => updateParams('from', e.target.value)}
          className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-1.5 rounded text-xs outline-none focus:ring-1 focus:ring-zinc-700 transition"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-zinc-400 font-medium text-xs">To:</label>
        <input 
          type="date" 
          value={to}
          onChange={(e) => updateParams('to', e.target.value)}
          className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-1.5 rounded text-xs outline-none focus:ring-1 focus:ring-zinc-700 transition"
        />
      </div>

      <input 
        type="text" 
        placeholder="Filter by action..." 
        value={action}
        onChange={(e) => updateParams('action', e.target.value)}
        className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-1.5 rounded text-xs outline-none focus:ring-1 focus:ring-zinc-700 transition placeholder-zinc-600"
      />

      <select 
        value={role} 
        onChange={(e) => updateParams('role', e.target.value)}
        className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-1.5 rounded text-xs outline-none focus:ring-1 focus:ring-zinc-700 transition"
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

