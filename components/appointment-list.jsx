'use client'

import { useState } from 'react'
import { respondToAppointment } from '@/app/appointments/actions'
import { Calendar, Clock, Phone, FileText, Check, X } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

const STATUS_BADGE = {
  pending:   { label: 'Pending Review', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: 'Confirmed',      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected:  { label: 'Rejected',       className: 'bg-red-50 text-red-700 border border-red-200' },
  cancelled: { label: 'Cancelled',      className: 'bg-zinc-50 text-zinc-600 border border-zinc-200' },
  completed: { label: 'Completed',      className: 'bg-zinc-50 text-zinc-600 border border-zinc-200' },
}

function parseExternalReason(reason) {
  if (reason && reason.startsWith('[External:')) {
    const match = reason.match(/^\[External:\s*([^,\]]+)(?:,\s*([^\]]+))?\]\s*(.*)$/);
    if (match) {
      return {
        isExternal: true,
        name: match[1],
        contact: match[2] || '',
        reason: match[3]
      };
    }
  }
  return {
    isExternal: false,
    name: '',
    contact: '',
    reason: reason || ''
  };
}

function RequestCard({ appt }) {
  const [responding, setResponding] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const badge = STATUS_BADGE[appt.status] || { label: appt.status, className: 'bg-zinc-50 text-zinc-600 border border-zinc-200' }
  const isPending = appt.status === 'pending'
  const parsed = parseExternalReason(appt.reason_for_visit)

  return (
    <div className="p-5 bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        {/* Left Side: Patient Information */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold shrink-0 text-sm">
            PT
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 text-sm">
              {parsed.isExternal ? `${parsed.name} (External)` : (appt.profiles?.full_name || 'Patient')}
            </h4>
            
            {appt.profiles?.phone && !parsed.isExternal && (
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-400" />
                {appt.profiles.phone}
              </p>
            )}

            {parsed.isExternal && parsed.contact && (
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-400" />
                Contact: {parsed.contact}
              </p>
            )}

            {/* Appointment Time details */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1 text-brand-600">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(appt.scheduled_at).toLocaleDateString('en-US', {
                  timeZone: GLOBAL_TIMEZONE, weekday: 'short', month: 'short', day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                {new Date(appt.scheduled_at).toLocaleTimeString('en-US', {
                  timeZone: GLOBAL_TIMEZONE, hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            {(parsed.isExternal ? parsed.reason : appt.reason_for_visit) && (
              <div className="text-xs text-zinc-500 mt-3 bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-zinc-700">Reason: </strong>
                  {parsed.isExternal ? parsed.reason : appt.reason_for_visit}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Status Badge */}
        <div className="shrink-0 flex items-start">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge.className}`}>
            {badge.label.toUpperCase()}
          </span>
        </div>

      </div>

      {/* Decline Dialog Panel */}
      {showRejectForm && (
        <form
          action={async (fd) => { setResponding(true); await respondToAppointment(fd) }}
          className="border-t border-zinc-100 pt-4 mt-1 flex flex-col gap-3 animate-fade-in"
        >
          <input type="hidden" name="appointmentId" value={appt.id} />
          <input type="hidden" name="status" value="rejected" />
          
          <div className="flex flex-col gap-1">
            <label className="type-label">
              Reason for declining (optional but recommended)
            </label>
            <input
              name="rejectionReason"
              type="text"
              placeholder="e.g. Not available at this time, please rebook..."
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className="px-3.5 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
            >
              Go back
            </button>
            <button
              type="submit"
              disabled={responding}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {responding ? 'Declining...' : 'Confirm decline'}
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Actions */}
      {isPending && !showRejectForm && (
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-50">
          <button
            onClick={() => setShowRejectForm(true)}
            className="border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Decline
          </button>
          
          <form action={async (fd) => { setResponding(true); await respondToAppointment(fd) }}>
            <input type="hidden" name="appointmentId" value={appt.id} />
            <input type="hidden" name="status" value="confirmed" />
            <button
              type="submit"
              disabled={responding}
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              {responding ? 'Confirming...' : 'Accept Request'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function AppointmentList({ initialAppointments, userId }) {
  const pending   = initialAppointments.filter(a => a.status === 'pending')
  const confirmed = initialAppointments.filter(a => a.status === 'confirmed')

  if (initialAppointments.length === 0) {
    return (
      <div className="text-center py-10 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
        <p className="text-sm text-zinc-400 font-medium italic">No active consultations.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Awaiting response ({pending.length})
          </p>
          <div className="space-y-3">
            {pending.map(a => <RequestCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}
      {confirmed.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Upcoming confirmed ({confirmed.length})
          </p>
          <div className="space-y-3">
            {confirmed.map(a => <RequestCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}
    </div>
  )
}