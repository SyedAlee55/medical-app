'use client'

import { useState } from 'react'
import { cancelAppointment } from '@/app/appointments/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_BADGE = {
  pending:    { label: 'Pending',    variant: 'secondary' },
  confirmed:  { label: 'Confirmed',  variant: 'default'   },
  rejected:   { label: 'Rejected',   variant: 'destructive' },
  cancelled:  { label: 'Cancelled',  variant: 'outline'   },
  completed:  { label: 'Completed',  variant: 'outline'   },
  overridden: { label: 'Rescheduled', variant: 'secondary' },
}

function canCancel(appt) {
  if (!['pending','confirmed'].includes(appt.status)) return false
  const twoHoursMs = 2 * 60 * 60 * 1000
  return Date.now() < new Date(appt.scheduled_at).getTime() - twoHoursMs
}

function AppointmentCard({ appt }) {
  const [cancelling, setCancelling] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const badge = STATUS_BADGE[appt.status] || { label: appt.status, variant: 'outline' }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">
            Dr. {appt.profiles?.full_name || 'Unknown'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {appt.specialties?.name || 'General'}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {new Date(appt.scheduled_at).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
          {appt.reason_for_visit && (
            <p className="text-xs text-slate-500 mt-1">{appt.reason_for_visit}</p>
          )}
          {appt.rejection_reason && appt.status === 'rejected' && (
            <p className="text-xs text-red-500 mt-1">
              Reason: {appt.rejection_reason}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {canCancel(appt) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 text-xs"
              onClick={() => setShowCancelForm(!showCancelForm)}
            >
              {showCancelForm ? 'Keep appointment' : 'Cancel'}
            </Button>
          )}
        </div>
      </div>

      {showCancelForm && (
        <form
          action={async (fd) => { setCancelling(true); await cancelAppointment(fd) }}
          className="border-t border-slate-100 pt-3 grid gap-3"
        >
          <input type="hidden" name="appointmentId" value={appt.id} />
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              Reason for cancellation (optional)
            </label>
            <input
              name="cancellationReason"
              type="text"
              placeholder="Let the doctor know why you're cancelling..."
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
          </Button>
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
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setFilter('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${
            filter === 'history'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">
          {filter === 'active'
            ? 'No active appointments. Book one below.'
            : 'No appointment history yet.'}
        </p>
      ) : (
        displayed.map(appt => <AppointmentCard key={appt.id} appt={appt} />)
      )}

      {filter === 'active' && (
        <a
          href="/patient/book"
          className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium mt-2"
        >
          + Book new appointment
        </a>
      )}
    </div>
  )
}
