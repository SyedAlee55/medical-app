import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updatePatientProfile } from './actions'

export default async function PatientOnboardingPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const hasError = params?.error === 'save_failed'

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 max-w-xs mx-auto">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm flex items-center justify-center">
              1
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Account</span>
          </div>
          <div className="flex-1 h-0.5 bg-brand-100 mx-2 -mt-4" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-semibold text-sm flex items-center justify-center">
              2
            </div>
            <span className="text-[10px] text-brand-600 font-semibold tracking-wider uppercase">Profile</span>
          </div>
          <div className="flex-1 h-0.5 bg-zinc-100 mx-2 -mt-4" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 font-semibold text-sm flex items-center justify-center">
              3
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Done</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="type-h3 text-zinc-900 font-bold">Complete your profile</h2>
          <p className="type-body text-zinc-500 text-sm mt-1.5">
            We need a few details to personalise your care experience. All data is secure.
          </p>
        </div>

        {hasError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            Something went wrong saving your profile. Please try again.
          </div>
        )}

        {/* Form */}
        <form action={updatePatientProfile} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dob" className="type-label">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gender" className="type-label">Gender</label>
              <select
                id="gender"
                name="gender"
                required
                className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="allergies" className="type-label">Known Allergies</label>
            <input
              id="allergies"
              name="allergies"
              type="text"
              placeholder="e.g. Penicillin, Peanuts (or 'None')"
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="history" className="type-label">Medical History</label>
            <textarea
              id="history"
              name="history"
              placeholder="Briefly describe any past surgeries or chronic conditions..."
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition min-h-[120px] resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-3 text-base transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(6,148,162,0.3)] active:scale-[0.98] cursor-pointer mt-2"
          >
            Finish Setup & Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}