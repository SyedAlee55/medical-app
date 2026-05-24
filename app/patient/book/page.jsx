import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BookingInterface from './BookingInterface'

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
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Book an Appointment
          </h1>
          <p className="text-slate-500 mt-1">
            Browse available doctors and send a consultation request.
          </p>
        </div>

        {params?.error && (
          <div className="mb-6 p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {errorMessages[params.error] || 'Something went wrong. Please try again.'}
          </div>
        )}

        {/* Specialty filter — URL param based, no client state */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form method="GET" className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1.5 flex-1 min-w-48">
                <label className="text-xs font-medium text-slate-600">
                  Filter by specialty
                </label>
                <select
                  name="specialty"
                  defaultValue={selectedSpecialtyId || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All specialties</option>
                  {specialties?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                Filter
              </button>
              {selectedSpecialtyId && (
                <a
                  href="/patient/book"
                  className="h-10 px-4 rounded-md border border-slate-200 text-slate-600 text-sm font-medium flex items-center"
                >
                  Clear
                </a>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Doctor list with booking forms */}
        {!doctors || doctors.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500 text-center py-8">
                {selectedSpecialtyId
                  ? 'No doctors available in this specialty right now.'
                  : 'No doctors are currently available.'}
              </p>
            </CardContent>
          </Card>
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
