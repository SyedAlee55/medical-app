'use client'

import { useState } from 'react'
import { exportActivityLogs } from '@/app/ceo/actions'

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
    <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded p-6">
      <h2 className="text-lg font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">Export JSON</h2>
      <form onSubmit={handleExport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-500">From Date</label>
          <input type="date" name="from" className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded text-sm" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-500">To Date</label>
          <input type="date" name="to" className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded text-sm" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-500">Actor ID (optional)</label>
          <input type="text" name="actorId" placeholder="UUID" className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded text-sm" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-wide text-zinc-500">Action Keyword (optional)</label>
          <input type="text" name="action" placeholder="LOGIN_SUCCESS" className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded text-sm" />
        </div>
        <div className="md:col-span-4 mt-2 flex items-center gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded text-sm font-medium"
          >
            {loading ? 'Exporting...' : 'Export JSON'}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  )
}
