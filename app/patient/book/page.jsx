import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookingPageClient from '@/components/booking-page-client'
import { AlertCircle } from 'lucide-react'

export default async function BookAppointmentPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  // Fetch all available active doctors
  const { data: doctors } = await supabase.rpc('get_available_doctors', {
    p_specialty_id: null,
    p_department:   null
  })

  const errorMessages = {
    missing_fields:  'Please fill in all required fields.',
    invalid_date:    'The date you entered is not valid.',
    too_soon:        'Appointments must be booked at least 1 hour in advance.',
    invalid_doctor:  'The selected doctor is no longer available.',
    time_conflict:   'That time slot is already taken for this doctor. Please choose a different time.',
    booking_failed:  'Booking failed. Please try again.',
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Book an Appointment
          </h1>
          <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
            Select a medical department below to view available doctors and request a consultation.
          </p>
        </div>

        {/* Error Banner */}
        {params?.error && (
          <div className="mb-6 bg-red-500/5 backdrop-blur-xl border border-red-500/15 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center gap-2.5 animate-fade-in shadow-[0_4px_20px_rgba(239,68,68,0.02)]">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMessages[params.error] || 'Something went wrong. Please try again.'}</span>
          </div>
        )}

        {/* Dynamic Department Grid & Booking Interface */}
        <BookingPageClient doctors={doctors || []} />

      </div>
    </div>
  )
}
