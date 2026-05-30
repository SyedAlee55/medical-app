'use client'

import { useState } from 'react'
import { createAppointment } from '@/app/admin/actions'
import { Loader2 } from 'lucide-react'
import { getGlobalDateTimeLocalString } from '@/utils/time'

export default function BookingForm({ patients, doctors }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientType, setPatientType] = useState('registered')

  // Disallow past dates
  const localISOTime = getGlobalDateTimeLocalString()

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-900">Book New Appointment</h2>
        <p className="text-xs text-zinc-500 mt-1">Manually schedule an appointment on behalf of a patient</p>
      </div>

      <form action={async (formData) => {
        setIsSubmitting(true)
        await createAppointment(formData)
        setIsSubmitting(false)
      }} className="space-y-5">
        <input type="hidden" name="patient_type" value={patientType} />
        
        {/* Toggle radio buttons */}
        <div className="flex gap-6 pb-2 border-b border-zinc-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 cursor-pointer group">
            <input
              type="radio"
              name="patient_type_toggle"
              value="registered"
              checked={patientType === 'registered'}
              onChange={() => setPatientType('registered')}
              className="w-4 h-4 text-brand-600 border-zinc-300 focus:ring-brand-500"
            />
            <span className="group-hover:text-zinc-900 transition-colors">Registered Patient</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 cursor-pointer group">
            <input
              type="radio"
              name="patient_type_toggle"
              value="external"
              checked={patientType === 'external'}
              onChange={() => setPatientType('external')}
              className="w-4 h-4 text-brand-600 border-zinc-300 focus:ring-brand-500"
            />
            <span className="group-hover:text-zinc-900 transition-colors">External Patient (Non-registered)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {patientType === 'registered' ? (
            <div className="space-y-1.5">
              <label htmlFor="patient_id" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Patient</label>
              <select
                id="patient_id"
                name="patient_id"
                className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
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
              <div className="space-y-1.5">
                <label htmlFor="external_name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Patient Name</label>
                <input
                  type="text"
                  id="external_name"
                  name="external_name"
                  placeholder="e.g. John Doe"
                  className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  required={patientType === 'external'}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="external_contact" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email or Phone</label>
                <input
                  type="text"
                  id="external_contact"
                  name="external_contact"
                  placeholder="e.g. email@example.com"
                  className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  required={patientType === 'external'}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="doctor_id" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Doctor</label>
            <select
              id="doctor_id"
              name="doctor_id"
              className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
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

        <div className="space-y-1.5">
          <label htmlFor="scheduled_at" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date & Time</label>
          <input
            type="datetime-local"
            id="scheduled_at"
            name="scheduled_at"
            min={localISOTime}
            className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reason_for_visit" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reason for Visit</label>
          <textarea
            id="reason_for_visit"
            name="reason_for_visit"
            rows={3}
            className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
            placeholder="Primary reason for the appointment..."
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
            placeholder="Internal notes (not visible to patient)"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-5 py-2.5 text-xs transition shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Booking...
            </>
          ) : (
            'Book Appointment'
          )}
        </button>
      </form>
    </div>
  )
}
