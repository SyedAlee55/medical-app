'use client'

import { useState } from 'react'
import { bookAppointment } from '@/app/appointments/actions'
import { getGlobalDateTimeLocalString } from '@/utils/time'

export default function BookingInterface({ doctor }) {
  const [expanded, setExpanded] = useState(false)
  const [pending, setPending] = useState(false)

  // Min datetime: 1 hour from now, formatted for datetime-local input in global timezone
  const minDateTime = getGlobalDateTimeLocalString(new Date(Date.now() + 60 * 60 * 1000))

  async function handleSubmit(formData) {
    setPending(true)
    await bookAppointment(formData)
    setPending(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-zinc-900 text-base">{doctor.full_name}</h3>
            {doctor.specialty_name && (
              <span className="bg-brand-50 text-brand-700 border border-brand-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                {doctor.specialty_name}
              </span>
            )}
            {doctor.department && (
              <span className="text-xs text-zinc-400 font-medium">| {doctor.department}</span>
            )}
          </div>
          {doctor.bio && (
            <p className="text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{doctor.bio}</p>
          )}
          <div className="flex gap-4 mt-3">
            <span className="text-xs text-zinc-400 font-medium">
              {doctor.pending_appointments} pending request{doctor.pending_appointments !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {doctor.confirmed_appointments} upcoming
            </span>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className={`w-full sm:w-auto font-semibold rounded-lg px-4 py-2.5 text-xs transition duration-200 cursor-pointer ${
              expanded
                ? 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98]'
            }`}
          >
            {expanded ? 'Cancel' : 'Request Appointment'}
          </button>
        </div>
      </div>

      {expanded && (
        <form action={handleSubmit} className="mt-6 border-t border-zinc-100 pt-6 flex flex-col gap-4 animate-fade-in">
          <input type="hidden" name="doctorId" value={doctor.id} />
          <input type="hidden" name="specialtyId" value={doctor.specialty_id || ''} />
          <input type="hidden" name="durationMinutes" value="30" />

          <div className="flex flex-col gap-1.5">
            <label className="type-label">
              Preferred date and time <span className="text-red-500">*</span>
            </label>
            <input
              name="scheduledAt"
              type="datetime-local"
              min={minDateTime}
              required
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="type-label">
              Reason for visit <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              rows={3}
              required
              maxLength={500}
              placeholder="Briefly describe your symptoms or reason for consultation..."
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition min-h-[100px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="type-label">
              Additional notes (optional)
            </label>
            <input
              name="notes"
              type="text"
              maxLength={500}
              placeholder="Any other information for the doctor..."
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-2.5 text-xs transition duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {pending ? 'Sending request...' : 'Send appointment request'}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
