'use client'

import { useState, useTransition } from 'react'
import { bookAppointment } from '@/app/appointments/actions'
import { getGlobalDateTimeLocalString } from '@/utils/time'
import { Loader2 } from 'lucide-react'

export default function BookingInterface({ doctor }) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const pending = isPending

  // Min datetime: 1 hour from now, formatted for datetime-local input in global timezone
  const minDateTime = getGlobalDateTimeLocalString(new Date(Date.now() + 60 * 60 * 1000))

  const handleSubmit = (formData) => {
    startTransition(async () => {
      try {
        await bookAppointment(formData)
      } catch (err) {
        if (err && err.digest && err.digest.startsWith('NEXT_REDIRECT')) {
          throw err
        }
      }
    })
  }

  return (
    <div className="relative overflow-hidden bg-zinc-950/30 backdrop-blur-2xl rounded-2xl border border-white/6 p-6 shadow-sm hover:border-brand-500/15 hover:shadow-[0_10px_30px_rgba(6,148,162,0.02)] transition duration-300 group">
      {pending && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-500/10 overflow-hidden z-50">
          <div className="absolute top-0 bottom-0 left-0 bg-brand-500 animate-progress-linear" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-white text-base">{doctor.full_name}</h3>
            {doctor.specialty_name && (
              <span className="bg-white/5 text-zinc-350 border border-white/8 text-[11px] font-semibold px-2.5 py-0.5 rounded-full group-hover:text-brand-300 group-hover:border-brand-400/15 transition-colors">
                {doctor.specialty_name}
              </span>
            )}
            {doctor.department && (
              <span className="text-xs text-zinc-500 font-medium">| {doctor.department}</span>
            )}
          </div>
          {doctor.bio && (
            <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{doctor.bio}</p>
          )}
          <div className="flex gap-4 mt-3">
            <span className="text-xs text-zinc-500 font-medium">
              {doctor.pending_appointments} pending request{doctor.pending_appointments !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {doctor.confirmed_appointments} upcoming
            </span>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className={`w-full sm:w-auto font-semibold rounded-xl px-4 py-2.5 text-xs transition duration-200 cursor-pointer ${
              expanded
                ? 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                : 'bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 shadow-[0_4px_12px_rgba(6,148,162,0.05)] active:scale-[0.98]'
            }`}
          >
            {expanded ? 'Cancel' : 'Request Appointment'}
          </button>
        </div>
      </div>

      {expanded && (
        <form action={handleSubmit} className="mt-6 border-t border-white/5 pt-6 flex flex-col gap-4 animate-fade-in">
          <input type="hidden" name="doctorId" value={doctor.id} />
          <input type="hidden" name="specialtyId" value={doctor.specialty_id || ''} />
          <input type="hidden" name="durationMinutes" value="30" />

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Preferred date and time <span className="text-red-400">*</span>
            </label>
            <input
              name="scheduledAt"
              type="datetime-local"
              min={minDateTime}
              required
              className="w-full bg-white/5 border border-white/8 text-zinc-300 placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Reason for visit <span className="text-red-400">*</span>
            </label>
            <textarea
              name="reason"
              rows={3}
              required
              maxLength={500}
              placeholder="Briefly describe your symptoms or reason for consultation..."
              className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition min-h-[100px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Additional notes (optional)
            </label>
            <input
              name="notes"
              type="text"
              maxLength={500}
              placeholder="Any other information for the doctor..."
              className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 shadow-[0_4px_12px_rgba(6,148,162,0.05)] active:scale-[0.98] disabled:opacity-50 font-semibold py-2.5 text-xs transition duration-200 cursor-pointer rounded-lg flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? 'Sending request...' : 'Send appointment request'}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
