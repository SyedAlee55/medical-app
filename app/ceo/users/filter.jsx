'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function UsersFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const role = searchParams.get('role') || ''
  const status = searchParams.get('status') || ''
  const includeDeleted = searchParams.get('includeDeleted') === 'true'

  function updateParams(key, value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push('?' + params.toString())
  }

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <select 
        value={role} 
        onChange={(e) => updateParams('role', e.target.value)}
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm p-2 rounded"
      >
        <option value="">All Roles</option>
        <option value="doctor">Doctor</option>
        <option value="staff">Staff</option>
      </select>

      <select 
        value={status} 
        onChange={(e) => updateParams('status', e.target.value)}
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm p-2 rounded"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
      </select>

      <label className="flex items-center gap-2 text-sm">
        <input 
          type="checkbox" 
          checked={includeDeleted}
          onChange={(e) => updateParams('includeDeleted', e.target.checked ? 'true' : '')}
          className="rounded border-zinc-300"
        />
        Show deleted accounts
      </label>
    </div>
  )
}
