'use client'

import { useState } from 'react'
import { cancelAppointment } from '@/app/appointments/actions'
import { Calendar, Clock, MapPin, X } from 'lucide-react'

const STATUS_BADGE = {
  pending:    { label: 'Pending',    className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed:  { label: 'Confirmed',  className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected:   { label: 'Rejected',   className: 'bg-red-50 text-red-700 border border-red-200' },
  cancelled:  { label: 'Cancelled',  className: 'bg-zinc-50 text-zinc-600 border border-zinc-200' },
  completed:  { label: 'Completed',  className: 'bg-zinc-50 text-zinc-600 border border-zinc-200' },
  overridden: { label: 'Rescheduled', className: 'bg-brand-50 text-brand-700 border border-brand-200' },
}

function canCancel(appt) {
  if (!['pending','confirmed'].includes(appt.status)) return false
  const twoHoursMs = 2 * 60 * 60 * 1000
  return Date.now() < new Date(appt.scheduled_at).getTime() - twoHoursMs
}

function AppointmentCard({ appt }) {
  const [cancelling, setCancelling] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const badge = STATUS_BADGE[appt.status] || { label: appt.status, className: 'bg-zinc-50 text-zinc-600 border border-zinc-200' }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Doctor & Time Details */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold shrink-0">
            DR
          </div>
          <div>
            <h4 className="font-semibold text-zinc-950 text-base">
              Dr. {appt.profiles?.full_name || 'Unknown'}
            </h4>
            <p className="text-xs font-medium text-brand-600 mt-0.5">
              {appt.specialties?.name || 'General Medicine'}
            </p>
            
            {/* Time Details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {new Date(appt.scheduled_at).toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {new Date(appt.scheduled_at).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            {appt.reason_for_visit && (
              <p className="text-xs text-zinc-500 mt-2 bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1.5 inline-block">
                <strong className="font-semibold text-zinc-700">Reason:</strong> {appt.reason_for_visit}
              </p>
            )}

            {appt.rejection_reason && appt.status === 'rejected' && (
              <p className="text-xs text-red-600 font-medium mt-2 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <strong className="font-semibold text-red-700">Rejection Reason:</strong> {appt.rejection_reason}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Status Badge & Actions */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
          
          {canCancel(appt) && (
            <button
              onClick={() => setShowCancelForm(prev => !prev)}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
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
          className="border-t border-zinc-100 pt-4 mt-2 flex flex-col gap-3 animate-fade-in"
        >
          <input type="hidden" name="appointmentId" value={appt.id} />
          
          <div className="flex flex-col gap-1.5">
            <label className="type-label">
              Reason for cancellation (optional)
            </label>
            <input
              name="cancellationReason"
              type="text"
              placeholder="Let the doctor know why you're cancelling..."
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={() => setShowCancelForm(false)}
              className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 cursor-pointer"
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
        <div className="bg-zinc-100 rounded-xl p-1 flex gap-1 w-fit">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              filter === 'active'
                ? 'bg-white shadow-sm text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Active ({active.length})
          </button>
          <button
            onClick={() => setFilter('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              filter === 'history'
                ? 'bg-white shadow-sm text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            History ({history.length})
          </button>
        </div>

        {filter === 'active' && (
          <a
            href="/patient/book"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] inline-flex items-center gap-1.5"
          >
            + Book new appointment
          </a>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-100 rounded-2xl">
          <p className="text-sm text-zinc-400 font-medium">
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
