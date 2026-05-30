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
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Book an Appointment
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm leading-relaxed">
            Browse available doctors and send a consultation request.
          </p>
        </div>

        {/* Error Banner */}
        {params?.error && (
          <div className="mb-6 bg-red-500/5 backdrop-blur-xl border border-red-500/15 rounded-lg px-4 py-3 text-sm text-red-300 flex items-center gap-2.5 animate-fade-in shadow-[0_4px_20px_rgba(239,68,68,0.02)]">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMessages[params.error] || 'Something went wrong. Please try again.'}</span>
          </div>
        )}

        {/* Specialty Filter Card */}
        <div className="bg-zinc-950/30 backdrop-blur-2xl border border-white/6 p-6 shadow-sm rounded-2xl mb-6">
          <form method="GET" className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Filter by specialty
              </label>
              <select
                name="specialty"
                defaultValue={selectedSpecialtyId || ''}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition cursor-pointer"
              >
                <option value="" className="bg-zinc-950">All specialties</option>
                {specialties?.map(s => (
                  <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer h-[42px] justify-center w-full sm:w-auto"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              
              {selectedSpecialtyId && (
                <a
                  href="/patient/book"
                  className="bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition inline-flex items-center gap-1.5 h-[42px] justify-center w-full sm:w-auto"
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
          <div className="bg-zinc-950/30 backdrop-blur-2xl border border-white/6 p-12 text-center rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <p className="text-sm text-zinc-500 font-medium">
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
