'use client'

import { useState } from 'react'
import { ceoOverrideAppointment } from '@/app/appointments/actions'
import { getGlobalDateTimeLocalString } from '@/utils/time'

export default function OverrideAction({ appointmentId, currentStatus, currentScheduledAt }) {
  const [editing, setEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [newDate, setNewDate] = useState(currentScheduledAt ? getGlobalDateTimeLocalString(new Date(currentScheduledAt)) : '')
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
      <div className="absolute right-0 top-full mt-2 z-50">
        <form action={handleConfirm} className="flex flex-col gap-2.5 p-4 border border-zinc-800 bg-zinc-950 rounded-xl min-w-[240px] shadow-xl text-left text-zinc-300">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</label>
            <select 
              name="status"
              value={newStatus} 
              onChange={e => setNewStatus(e.target.value)}
              className="border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs p-1.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-700 transition"
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reschedule</label>
            <input 
              type="datetime-local" 
              name="scheduledAt"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs p-1.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-700 transition"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Override Notes</label>
            <input 
              type="text" 
              name="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Reason for override..."
              className="border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs p-1.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-700 transition placeholder-zinc-600"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white px-2 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              Confirm
            </button>
            <button 
              type="button" 
              disabled={loading} 
              onClick={() => setEditing(false)} 
              className="flex-1 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 px-2 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <button 
      onClick={() => setEditing(true)} 
      className="border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer whitespace-nowrap"
    >
      Override
    </button>
  )
}

