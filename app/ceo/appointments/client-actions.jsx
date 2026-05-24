'use client'

import { useState } from 'react'
import { ceoOverrideAppointment } from '@/app/appointments/actions'

export function OverrideAction({ appointmentId, currentStatus, currentScheduledAt }) {
  const [editing, setEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [newDate, setNewDate] = useState(currentScheduledAt ? new Date(currentScheduledAt).toISOString().slice(0, 16) : '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirm(formData) {
    setLoading(true)
    await ceoOverrideAppointment(formData)
    setLoading(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <form action={handleConfirm} className="flex flex-col gap-2 p-3 border border-zinc-200 bg-zinc-50 rounded min-w-[220px] shadow-sm z-10 relative">
        <input type="hidden" name="appointmentId" value={appointmentId} />
        
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-600">Status</label>
            <select 
            name="status"
            value={newStatus} 
            onChange={e => setNewStatus(e.target.value)}
            className="border border-zinc-200 bg-white text-xs p-1.5 rounded"
            disabled={loading}
            >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="overridden">Overridden</option>
            </select>
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-600">Reschedule</label>
            <input 
            type="datetime-local" 
            name="scheduledAt"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="border border-zinc-200 bg-white text-xs p-1.5 rounded"
            disabled={loading}
            />
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-600">Override Notes</label>
            <input 
            type="text" 
            name="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Reason for override..."
            className="border border-zinc-200 bg-white text-xs p-1.5 rounded"
            disabled={loading}
            />
        </div>

        <div className="flex gap-2 mt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-2 py-1.5 text-xs font-medium rounded hover:bg-blue-700">Confirm</button>
          <button type="button" disabled={loading} onClick={() => setEditing(false)} className="flex-1 border border-zinc-200 text-zinc-700 bg-white px-2 py-1.5 text-xs font-medium rounded hover:bg-zinc-100">Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <button onClick={() => setEditing(true)} className="text-xs font-medium bg-zinc-100 px-3 py-1 rounded border border-zinc-200 text-zinc-700 hover:bg-zinc-200">
      Override
    </button>
  )
}
