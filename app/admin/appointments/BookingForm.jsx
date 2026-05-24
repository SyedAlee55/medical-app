'use client'

import { useState } from 'react'
import { createAppointment } from '@/app/admin/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function BookingForm({ patients, doctors }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientType, setPatientType] = useState('registered')

  // Disallow past dates
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book New Appointment</CardTitle>
        <CardDescription>Manually schedule an appointment on behalf of a patient</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={async (formData) => {
          setIsSubmitting(true)
          await createAppointment(formData)
          setIsSubmitting(false)
        }} className="space-y-4">
          <input type="hidden" name="patient_type" value={patientType} />
          
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="radio"
                name="patient_type_toggle"
                value="registered"
                checked={patientType === 'registered'}
                onChange={() => setPatientType('registered')}
                className="text-slate-900 focus:ring-slate-900 border-slate-300 dark:border-slate-800"
              />
              Registered Patient
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="radio"
                name="patient_type_toggle"
                value="external"
                checked={patientType === 'external'}
                onChange={() => setPatientType('external')}
                className="text-slate-900 focus:ring-slate-900 border-slate-300 dark:border-slate-800"
              />
              External Patient (Non-registered)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientType === 'registered' ? (
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient</Label>
                <select
                  id="patient_id"
                  name="patient_id"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                  required={patientType === 'registered'}
                >
                  <option value="">Select a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4 md:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="external_name">Patient Name</Label>
                  <input
                    type="text"
                    id="external_name"
                    name="external_name"
                    placeholder="e.g. John Doe"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    required={patientType === 'external'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="external_contact">Email or Phone Number</Label>
                  <input
                    type="text"
                    id="external_contact"
                    name="external_contact"
                    placeholder="e.g. email@example.com or 123-456-7890"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    required={patientType === 'external'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="doctor_id">Doctor</Label>
              <select
                id="doctor_id"
                name="doctor_id"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                required
              >
                <option value="">Select a doctor...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.department || d.specialties?.name || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Date & Time</Label>
            <input
              type="datetime-local"
              id="scheduled_at"
              name="scheduled_at"
              min={localISOTime}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason_for_visit">Reason for Visit</Label>
            <textarea
              id="reason_for_visit"
              name="reason_for_visit"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              placeholder="Primary reason for the appointment..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              placeholder="Internal notes (not visible to patient)"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              'Book Appointment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
