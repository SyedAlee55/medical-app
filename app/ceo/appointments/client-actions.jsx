'use client'

import { useState } from 'react'
import { overrideAppointment } from '@/app/ceo/actions'
import { useRouter } from 'next/navigation'

export function OverrideAction({ appointmentId, currentStatus }) {
  const [editing, setEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    if (newStatus === currentStatus) {
      setEditing(false)
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('appointmentId', appointmentId)
    formData.append('status', newStatus)
    await overrideAppointment(formData)
    setLoading(false)
    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <select 
          value={newStatus} 
          onChange={e => setNewStatus(e.target.value)}
          className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs p-1 rounded"
          disabled={loading}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
          <option value="overridden">Overridden</option>
        </select>
        <button disabled={loading} onClick={handleConfirm} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-1 text-xs rounded">Confirm</button>
        <button disabled={loading} onClick={() => setEditing(false)} className="text-xs text-zinc-500 hover:text-zinc-900">Cancel</button>
      </div>
    )
  }

  return (
    <button onClick={() => setEditing(true)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
      Override
    </button>
  )
}
