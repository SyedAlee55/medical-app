'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function EmployeeIdFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filter = searchParams.get('filter') || 'unverified'

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
        className="border border-zinc-800 bg-zinc-950 text-zinc-300 text-sm p-2 rounded outline-none focus:ring-1 focus:ring-zinc-700 transition"
      >
        <option value="all">All IDs</option>
        <option value="verified">Verified Only</option>
        <option value="unverified">Unverified Only</option>
      </select>
    </div>
  )
}

