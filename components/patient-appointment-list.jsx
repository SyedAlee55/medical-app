'use client'

import { useState } from 'react'
import { cancelAppointment } from '@/app/appointments/actions'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

const STATUS_BADGE = {
  pending:    { label: 'Pending',    className: 'bg-white/5 text-zinc-300 border border-white/10' },
  confirmed:  { label: 'Confirmed',  className: 'bg-emerald-500/5 text-emerald-300/80 border border-emerald-500/15' },
  rejected:   { label: 'Rejected',   className: 'bg-red-500/5 text-red-300/80 border border-red-500/15' },
  cancelled:  { label: 'Cancelled',  className: 'bg-white/4 text-zinc-450 border border-white/8' },
  completed:  { label: 'Completed',  className: 'bg-white/4 text-zinc-450 border border-white/8' },
  overridden: { label: 'Rescheduled', className: 'bg-brand-500/5 text-brand-300/80 border border-brand-500/15' },
}

function canCancel(appt) {
  if (!['pending','confirmed'].includes(appt.status)) return false
  const twoHoursMs = 2 * 60 * 60 * 1000
  return Date.now() < new Date(appt.scheduled_at).getTime() - twoHoursMs
}

function AppointmentCard({ appt }) {
  const [cancelling, setCancelling] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const badge = STATUS_BADGE[appt.status] || { label: appt.status, className: 'bg-white/5 text-zinc-400 border border-white/10' }

  return (
    <div className="bg-zinc-950/30 backdrop-blur-2xl rounded-2xl border border-white/6 p-6 shadow-sm hover:border-brand-500/15 hover:shadow-[0_10px_30px_rgba(6,148,162,0.02)] transition duration-300 flex flex-col gap-4 group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Doctor & Time Details */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-zinc-350 font-bold shrink-0 shadow-[0_0_10px_rgba(6,148,162,0.02)] group-hover:bg-brand-500/10 group-hover:text-brand-300 transition-all duration-300">
            DR
          </div>
          <div>
            <h4 className="font-semibold text-white text-base">
              Dr. {appt.profiles?.full_name || 'Unknown'}
            </h4>
            <p className="text-xs font-semibold text-brand-400 mt-0.5">
              {appt.specialties?.name || 'General Medicine'}
            </p>
            
            {/* Time Details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-450 group-hover:text-brand-300 transition-colors" />
                {new Date(appt.scheduled_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE, 
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-450 group-hover:text-brand-300 transition-colors" />
                {new Date(appt.scheduled_at).toLocaleTimeString('en-US', { timeZone: GLOBAL_TIMEZONE, 
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            {appt.reason_for_visit && (
              <p className="text-xs text-zinc-350 mt-3 bg-white/5 border border-white/8 rounded-lg px-2.5 py-1.5 inline-block leading-relaxed">
                <strong className="font-semibold text-zinc-400">Reason:</strong> {appt.reason_for_visit}
              </p>
            )}

            {appt.rejection_reason && appt.status === 'rejected' && (
              <p className="text-xs text-red-300 font-medium mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
                <strong className="font-semibold text-red-400">Rejection Reason:</strong> {appt.rejection_reason}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Status Badge & Actions */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
          
          {canCancel(appt) && (
            <button
              onClick={() => setShowCancelForm(prev => !prev)}
              className="text-xs font-semibold text-red-400 hover:text-red-350 hover:underline cursor-pointer transition-colors"
            >
              {showCancelForm ? 'Keep appointment' : 'Cancel booking'}
            </button>
          )}
        </div>

      </div>

      {/* Cancel Confirmation Form */}
      {showCancelForm && (
        <form
          action={async (fd) => {
            setCancelling(true)
            await cancelAppointment(fd)
          }}
          className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-3 animate-fade-in"
        >
          <input type="hidden" name="appointmentId" value={appt.id} />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Reason for cancellation (optional)
            </label>
            <input
              name="cancellationReason"
              type="text"
              placeholder="Let the doctor know why you're cancelling..."
              className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={() => setShowCancelForm(false)}
              className="px-4 py-2 bg-white/5 border border-white/8 text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="bg-red-500/10 backdrop-blur-md border border-red-400/20 text-red-300 hover:bg-red-500/20 hover:border-red-400/35 font-semibold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function PatientAppointmentList({ initialAppointments }) {
  const [filter, setFilter] = useState('active')

  const active = initialAppointments.filter(a =>
    ['pending','confirmed'].includes(a.status))
  const history = initialAppointments.filter(a =>
    ['completed','rejected','cancelled','overridden'].includes(a.status))

  const displayed = filter === 'active' ? active : history

  return (
    <div className="space-y-6">
      {/* Header and Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tab switcher */}
        <div className="bg-white/5 border border-white/8 rounded-xl p-1 flex gap-1 w-fit">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              filter === 'active'
                ? 'bg-brand-500/10 border border-brand-400/15 text-white backdrop-blur-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active ({active.length})
          </button>
          <button
            onClick={() => setFilter('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              filter === 'history'
                ? 'bg-brand-500/10 border border-brand-400/15 text-white backdrop-blur-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            History ({history.length})
          </button>
        </div>

        {filter === 'active' && (
          <a
            href="/patient/book"
            className="bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 transition-all duration-300 font-semibold rounded-xl px-4 py-2.5 text-sm shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
          >
            + Book new appointment
          </a>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950/30 backdrop-blur-2xl border border-white/6 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
          <p className="text-sm text-zinc-500 font-medium">
            {filter === 'active'
              ? 'No active appointments. Book one above.'
              : 'No appointment history yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayed.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
        </div>
      )}
    </div>
  )
}
