'use client'

import { useState } from 'react'
import { bookAppointment } from '@/app/appointments/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function BookingInterface({ doctor }) {
  const [expanded, setExpanded] = useState(false)
  const [pending, setPending] = useState(false)

  // Min datetime: 1 hour from now, formatted for datetime-local input
  const minDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString().slice(0, 16)

  async function handleSubmit(formData) {
    setPending(true)
    await bookAppointment(formData)
    // redirect happens in the action — setPending never reaches false on success
    setPending(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-semibold text-slate-900">{doctor.full_name}</p>
              {doctor.specialty_name && (
                <Badge variant="secondary">{doctor.specialty_name}</Badge>
              )}
              {doctor.department && (
                <span className="text-xs text-slate-500">{doctor.department}</span>
              )}
            </div>
            {doctor.bio && (
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{doctor.bio}</p>
            )}
            <div className="flex gap-4 mt-2">
              <span className="text-xs text-slate-400">
                {doctor.pending_appointments} pending request{doctor.pending_appointments !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-slate-400">
                {doctor.confirmed_appointments} upcoming
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant={expanded ? 'outline' : 'default'}
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className={expanded ? '' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {expanded ? 'Cancel' : 'Request Appointment'}
          </Button>
        </div>

        {expanded && (
          <form action={handleSubmit} className="mt-6 border-t border-slate-100 pt-6 grid gap-4">
            <input type="hidden" name="doctorId" value={doctor.id} />
            <input type="hidden" name="specialtyId" value={doctor.specialty_id || ''} />
            <input type="hidden" name="durationMinutes" value="30" />

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Preferred date and time <span className="text-red-500">*</span>
              </label>
              <input
                name="scheduledAt"
                type="datetime-local"
                min={minDateTime}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Reason for visit <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                rows={3}
                required
                maxLength={500}
                placeholder="Briefly describe your symptoms or reason for consultation..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Additional notes (optional)
              </label>
              <input
                name="notes"
                type="text"
                maxLength={500}
                placeholder="Any other information for the doctor..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={pending}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                {pending ? 'Sending request...' : 'Send appointment request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setExpanded(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
