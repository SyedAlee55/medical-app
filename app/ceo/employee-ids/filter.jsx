'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function EmployeeIdFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filter = searchParams.get('filter') || 'all'

  function updateParams(value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set('filter', value)
    else params.delete('filter')
    router.push('?' + params.toString())
  }

  return (
    <div className="mb-6">
      <select 
        value={filter} 
        onChange={(e) => updateParams(e.target.value)}
        className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm p-2 rounded"
      >
        <option value="all">All IDs</option>
        <option value="verified">Verified Only</option>
        <option value="unverified">Unverified Only</option>
      </select>
    </div>
  )
}
