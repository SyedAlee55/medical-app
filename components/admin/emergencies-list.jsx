'use client'

import { useState, useTransition } from 'react'
import { respondToEmergencyAppointment } from '@/app/admin/actions'
import { Calendar, Clock, User, Phone, Mail, FileText, Check, X, Loader2, AlertTriangle } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

const STATUS_BADGE = {
  pending:    { label: 'Pending',    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' },
  confirmed:  { label: 'Confirmed',  className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  rejected:   { label: 'Rejected',   className: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  cancelled:  { label: 'Cancelled',  className: 'bg-zinc-800 text-zinc-400 border border-zinc-700' },
  completed:  { label: 'Completed',  className: 'bg-zinc-800 text-zinc-400 border border-zinc-700' },
  overridden: { label: 'Rescheduled', className: 'bg-brand-500/10 text-brand-400 border border-brand-500/20' },
}

export default function EmergenciesList({ initialEmergencies }) {
  const [filter, setFilter] = useState('active')
  const [isPending, startTransition] = useTransition()
  const [declineId, setDeclineId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const active = initialEmergencies.filter(e => e.status === 'pending')
  const history = initialEmergencies.filter(e => e.status !== 'pending')

  const displayed = filter === 'active' ? active : history

  const handleAction = (appointmentId, status) => {
    const formData = new FormData()
    formData.append('appointmentId', appointmentId)
    formData.append('status', status)
    if (status === 'rejected') {
      formData.append('rejectionReason', rejectionReason)
    }

    startTransition(async () => {
      try {
        await respondToEmergencyAppointment(formData)
        setDeclineId(null)
        setRejectionReason('')
      } catch (err) {
        if (err && err.digest && err.digest.startsWith('NEXT_REDIRECT')) {
          throw err
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="bg-zinc-800 p-1 rounded-xl flex gap-1 w-fit">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            filter === 'active'
              ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          Active Requests ({active.length})
        </button>
        <button
          onClick={() => setFilter('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            filter === 'history'
              ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm text-center">
          <Check className="h-12 w-12 text-emerald-400 mb-4 bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20" />
          <h3 className="text-base font-semibold text-zinc-100">
            {filter === 'active' ? 'No active emergency requests' : 'No emergency history'}
          </h3>
          <p className="text-xs text-zinc-400 font-medium max-w-sm mt-1">
            {filter === 'active' 
              ? 'All emergency patient consultation requests have been reviewed.' 
              : 'Emergency request history will appear here once handled.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((appt) => {
            const badge = STATUS_BADGE[appt.status] || { label: appt.status, className: 'bg-zinc-50 text-zinc-650' }
            const isDeclining = declineId === appt.id

            return (
              <div
                key={appt.id}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col gap-5"
              >
                {/* Visual indicator bar on the left for pending emergency */}
                {appt.status === 'pending' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 animate-pulse" />
                )}

                {/* Top Info Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Patient Identity */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-zinc-100 text-lg">
                        {appt.patient?.full_name || 'Patient'}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-450 font-medium">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        {appt.patient?.email || 'N/A'}
                      </span>
                      {appt.patient?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          {appt.patient.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: Action triggers or timestamp */}
                  {appt.status === 'pending' ? (
                    <div className="flex items-center gap-3 self-end md:self-center">
                      {!isDeclining && (
                        <>
                          <button
                            disabled={isPending}
                            onClick={() => setDeclineId(appt.id)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-semibold rounded-lg px-4 py-2 text-xs transition duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleAction(appt.id, 'confirmed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2 text-xs transition duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Confirm Appointment
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-right text-xs text-zinc-400 font-medium">
                      <span>Processed: </span>
                      {new Date(appt.created_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE, 
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                  {/* Left: Consultation Target details */}
                  <div className="space-y-3">
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-400 block">Assigned Doctor:</span>
                      <span className="font-bold text-zinc-100 text-sm mt-0.5 inline-block">
                        Dr. {appt.doctor?.full_name || 'Emergency Physician'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400">
                      <span className="flex items-center gap-1 bg-zinc-950/50 border border-zinc-800 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(appt.scheduled_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE, 
                          weekday: 'short', month: 'short', day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1 bg-zinc-950/50 border border-zinc-800 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(appt.scheduled_at).toLocaleTimeString('en-US', { timeZone: GLOBAL_TIMEZONE, 
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Reason for Visit / Symptoms */}
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                          Reason for Urgent Visit
                        </span>
                        <p className="text-xs text-zinc-200 leading-relaxed font-semibold mt-1">
                          {appt.reason_for_visit || 'No reason provided.'}
                        </p>
                      </div>
                    </div>

                    {appt.notes && (
                      <p className="text-xs text-zinc-500 italic mt-2 border-t border-zinc-800 pt-2">
                        <span className="font-semibold not-italic text-zinc-500 text-[10px] uppercase tracking-wider block mb-0.5">Notes:</span>
                        {appt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Optional metadata: rejection or cancellation reason */}
                {appt.status === 'rejected' && appt.rejection_reason && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">Rejection Reason</span>
                      <p className="text-xs mt-1 font-semibold">{appt.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {appt.status === 'cancelled' && appt.cancellation_reason && (
                  <div className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl p-4 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Cancellation Reason</span>
                      <p className="text-xs mt-1 font-semibold">{appt.cancellation_reason}</p>
                    </div>
                  </div>
                )}

                {/* Decline Form overlay inside the card */}
                {isDeclining && (
                  <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3 animate-fade-in">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Reason for decline/rejection <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please explain why this emergency appointment is declined..."
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition resize-none font-medium"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDeclineId(null)
                          setRejectionReason('')
                        }}
                        className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isPending || !rejectionReason.trim()}
                        onClick={() => handleAction(appt.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
