import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { saveDoctorProfile } from './actions'

export default async function DoctorOnboardingPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, full_name, phone, specialty_id, department, bio, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name')
    .order('name', { ascending: true })

  const params = await searchParams
  const hasError = params?.error === 'save_failed'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
      <div className="bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 w-full max-w-xl shadow-[0_10px_50px_rgba(0,0,0,0.3)]">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 max-w-xs mx-auto">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-white/10 text-zinc-350 border border-white/10 font-semibold text-sm flex items-center justify-center">
              1
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Account</span>
          </div>
          <div className="flex-1 h-0.5 bg-brand-500/20 mx-2 -mt-4" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 font-semibold text-sm flex items-center justify-center shadow-[0_0_15px_rgba(6,148,162,0.15)]">
              2
            </div>
            <span className="text-[10px] text-brand-300 font-semibold tracking-wider uppercase">Profile</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/5 mx-2 -mt-4" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-white/5 text-zinc-600 border border-white/5 font-semibold text-sm flex items-center justify-center">
              3
            </div>
            <span className="text-[10px] text-zinc-650 font-semibold tracking-wider uppercase">Review</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Complete your professional profile</h2>
          <p className="text-sm text-zinc-450 mt-1.5">
            Your profile will be reviewed by the administrator before your account is activated.
          </p>
        </div>

        {hasError && (
          <div className="mb-6 bg-red-500/5 backdrop-blur-xl border border-red-500/15 rounded-lg px-4 py-3 text-sm text-red-300 flex items-center gap-2.5 animate-fade-in shadow-[0_4px_20px_rgba(239,68,68,0.02)]">
            Something went wrong saving your profile. Please try again.
          </div>
        )}

        {/* Form */}
        <form action={saveDoctorProfile} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Full name <span className="text-red-400">*</span></label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name || ''}
              required
              className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone || ''}
                className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="employee_id" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Employee ID</label>
              <input
                id="employee_id"
                name="employee_id"
                type="text"
                defaultValue={profile.employee_id || ''}
                placeholder="Your hospital-issued ID"
                className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="specialty_id" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Specialty</label>
              <select
                id="specialty_id"
                name="specialty_id"
                defaultValue={profile.specialty_id || ''}
                className="w-full bg-zinc-900 border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition cursor-pointer"
              >
                <option value="" className="bg-zinc-950">Select a specialty</option>
                {specialties?.map(s => (
                  <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="department" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                defaultValue={profile.department || ''}
                placeholder="e.g. Cardiology"
                className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={profile.bio || ''}
              placeholder="Brief professional background and qualifications..."
              className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition min-h-[100px] resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white hover:bg-brand-500/20 hover:border-brand-400/35 font-semibold rounded-xl py-3 text-base shadow-[0_4px_15px_rgba(6,148,162,0.05)] active:scale-[0.98] transition-all duration-300 cursor-pointer mt-2"
          >
            Submit profile for review
          </button>
        </form>
      </div>
    </div>
  )
}
