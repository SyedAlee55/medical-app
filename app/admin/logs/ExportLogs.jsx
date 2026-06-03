'use client'

import { useState } from 'react'
import { exportActivityLogs } from '@/app/admin/actions'

export default function ExportLogs() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleExport(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.target)

    const result = await exportActivityLogs(formData)
    
    if (result.error) {
      setError('Export failed. Try again.')
      setLoading(false)
      return
    }

    const blob = new Blob([result.data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    a.click()
    URL.revokeObjectURL(url)
    
    setLoading(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
      <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">Export JSON</h2>
      <form onSubmit={handleExport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="grid gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">From Date</label>
          <input type="date" name="from" className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">To Date</label>
          <input type="date" name="to" className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Actor ID (optional)</label>
          <input type="text" name="actorId" placeholder="UUID" className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-zinc-700 transition placeholder-zinc-600" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Action Keyword (optional)</label>
          <input type="text" name="action" placeholder="LOGIN_SUCCESS" className="border border-zinc-800 bg-zinc-950 text-zinc-300 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-zinc-700 transition placeholder-zinc-600" />
        </div>
        <div className="md:col-span-4 mt-2 flex items-center gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Exporting...' : 'Export JSON'}
          </button>
          {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
        </div>
      </form>
    </div>
  )
}

