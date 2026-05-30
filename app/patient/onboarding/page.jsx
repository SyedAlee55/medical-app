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
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 w-full max-w-lg shadow-[0_10px_50px_rgba(0,0,0,0.3)]">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 max-w-xs mx-auto">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-white/5 text-zinc-400 border border-white/8 font-semibold text-sm flex items-center justify-center">
              1
            </div>
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Account</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/10 mx-2 -mt-4" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-zinc-300 border border-brand-400/20 font-semibold text-sm flex items-center justify-center shadow-[0_0_12px_rgba(6,148,162,0.06)]">
              2
            </div>
            <span className="text-[10px] text-zinc-350 font-semibold tracking-wider uppercase">Profile</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/5 mx-2 -mt-4" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-white/5 text-zinc-500 border border-white/8 font-semibold text-sm flex items-center justify-center">
              3
            </div>
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Done</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Complete your profile</h2>
          <p className="text-sm text-zinc-400 mt-1.5">
            We need a few details to personalise your care experience. All data is secure.
          </p>
        </div>

        {hasError && (
          <div className="mb-6 bg-red-500/5 backdrop-blur-md border border-red-500/15 rounded-lg px-4 py-3 text-sm text-red-300">
            Something went wrong saving your profile. Please try again.
          </div>
        )}

        {/* Form */}
        <form action={updatePatientProfile} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dob" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="w-full bg-white/5 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gender" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Gender</label>
              <select
                id="gender"
                name="gender"
                required
                className="w-full bg-zinc-900 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
              >
                <option value="" className="bg-zinc-950">Select...</option>
                <option value="male" className="bg-zinc-950">Male</option>
                <option value="female" className="bg-zinc-950">Female</option>
                <option value="other" className="bg-zinc-950">Other</option>
                <option value="prefer_not_to_say" className="bg-zinc-950">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="allergies" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Known Allergies</label>
            <input
              id="allergies"
              name="allergies"
              type="text"
              placeholder="e.g. Penicillin, Peanuts (or 'None')"
              className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="history" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Medical History</label>
            <textarea
              id="history"
              name="history"
              placeholder="Briefly describe any past surgeries or chronic conditions..."
              className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition min-h-[120px] resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 cursor-pointer mt-2"
          >
            Finish Setup & Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}