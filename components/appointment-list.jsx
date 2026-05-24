'use client'

import { useState } from 'react'
import { respondToAppointment } from '@/app/appointments/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STATUS_BADGE = {
  pending:   { label: 'Pending Review', variant: 'secondary'   },
  confirmed: { label: 'Confirmed',      variant: 'default'     },
  rejected:  { label: 'Rejected',       variant: 'destructive' },
  cancelled: { label: 'Cancelled',      variant: 'outline'     },
  completed: { label: 'Completed',      variant: 'outline'     },
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
  const badge = STATUS_BADGE[appt.status] || { label: appt.status, variant: 'outline' }
  const isPending = appt.status === 'pending'
  const parsed = parseExternalReason(appt.reason_for_visit)

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">
            {parsed.isExternal ? `${parsed.name} (External)` : (appt.profiles?.full_name || 'Patient')}
          </p>
          {parsed.isExternal && (
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Contact: {parsed.contact}</p>
          )}
          <p className="text-sm text-slate-600 mt-0.5">
            {new Date(appt.scheduled_at).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
          {(parsed.isExternal ? parsed.reason : appt.reason_for_visit) && (
            <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 px-2 py-1 rounded">
              {parsed.isExternal ? parsed.reason : appt.reason_for_visit}
            </p>
          )}
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {isPending && !showRejectForm && (
        <div className="flex gap-2 pt-1">
          <form action={async (fd) => { setResponding(true); await respondToAppointment(fd) }}>
            <input type="hidden" name="appointmentId" value={appt.id} />
            <input type="hidden" name="status" value="confirmed" />
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={responding}>
              {responding ? 'Confirming...' : 'Accept'}
            </Button>
          </form>
          <Button
            variant="outline" size="sm"
            onClick={() => setShowRejectForm(true)}
          >
            Decline
          </Button>
        </div>
      )}

      {showRejectForm && (
        <form
          action={async (fd) => { setResponding(true); await respondToAppointment(fd) }}
          className="border-t border-slate-100 pt-3 grid gap-3"
        >
          <input type="hidden" name="appointmentId" value={appt.id} />
          <input type="hidden" name="status" value="rejected" />
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              Reason for declining (optional but recommended)
            </label>
            <input
              name="rejectionReason"
              type="text"
              placeholder="e.g. Not available at this time, please rebook..."
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={responding}>
              {responding ? 'Declining...' : 'Confirm decline'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
              Go back
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function AppointmentList({ initialAppointments, userId }) {
  const pending   = initialAppointments.filter(a => a.status === 'pending')
  const confirmed = initialAppointments.filter(a => a.status === 'confirmed')

  if (initialAppointments.length === 0) {
    return <p className="text-sm text-slate-500 italic">No active consultations.</p>
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Awaiting response ({pending.length})
          </p>
          <div className="space-y-3">
            {pending.map(a => <RequestCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}
      {confirmed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
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