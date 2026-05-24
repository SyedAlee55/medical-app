import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookingInterface from './BookingInterface'
import { AlertCircle, Filter, X } from 'lucide-react'

export default async function BookAppointmentPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const selectedSpecialtyId = params?.specialty || null

  // Fetch specialties for filter
  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name')
    .order('name', { ascending: true })

  // Fetch available doctors — filter by specialty if selected
  const { data: doctors } = await supabase.rpc('get_available_doctors', {
    p_specialty_id: selectedSpecialtyId,
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
    <div className="p-8 bg-zinc-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Book an Appointment
          </h1>
          <p className="type-body text-zinc-500 mt-1">
            Browse available doctors and send a consultation request.
          </p>
        </div>

        {/* Error Banner */}
        {params?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessages[params.error] || 'Something went wrong. Please try again.'}</span>
          </div>
        )}

        {/* Specialty Filter Card */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm mb-6">
          <form method="GET" className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="type-label">
                Filter by specialty
              </label>
              <select
                name="specialty"
                defaultValue={selectedSpecialtyId || ''}
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              >
                <option value="">All specialties</option>
                {specialties?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer h-[42px]"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              
              {selectedSpecialtyId && (
                <a
                  href="/patient/book"
                  className="border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-semibold rounded-lg px-4 py-2.5 text-sm transition inline-flex items-center gap-1.5 h-[42px]"
                >
                  <X className="w-4 h-4" />
                  Clear
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Doctor List */}
        {!doctors || doctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center shadow-sm">
            <p className="text-sm text-zinc-400 font-medium">
              {selectedSpecialtyId
                ? 'No doctors available in this specialty right now.'
                : 'No doctors are currently available.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {doctors.map(doctor => (
              <BookingInterface key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
