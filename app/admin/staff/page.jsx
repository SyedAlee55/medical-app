import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { suspendUser, reactivateUser } from '@/app/admin/actions'
import Link from 'next/link'
import { Stethoscope, Briefcase } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

export const dynamic = 'force-dynamic'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

export default async function AdminStaffPage() {
  const supabase = await createClient()

  // Verify Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'ceo')) {
    redirect('/403')
  }

  // Fetch Staff & Doctors
  const { data: staffProfiles } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, role, department, status, created_at,
      specialties(name)
    `)
    .in('role', ['doctor', 'staff'])
    .in('status', ['active', 'suspended'])
    .order('full_name', { ascending: true })

  const totalDoctors = staffProfiles?.filter(p => p.role === 'doctor').length || 0
  const totalStaff   = staffProfiles?.filter(p => p.role === 'staff').length   || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Doctors &amp; Staff Directory</h1>
          <p className="type-body text-zinc-400 text-sm mt-0.5">Active healthcare providers across all departments</p>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-3.5 py-1.5 rounded-full">
            <Stethoscope className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-semibold text-brand-400">{totalDoctors} Doctors</span>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400">{totalStaff} Staff</span>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {staffProfiles?.length > 0 ? (
          staffProfiles.map(p => (
            <div
              key={p.id}
              className={`bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden relative transition hover:shadow-md ${
                p.status === 'suspended' ? 'opacity-70' : ''
              }`}
            >
              {p.status === 'suspended' && (
                <div className="absolute top-0 left-0 right-0 bg-orange-500/10 text-orange-400 text-[10px] font-bold text-center py-1.5 border-b border-orange-500/25 tracking-widest uppercase">
                  Suspended
                </div>
              )}

              <div className={`p-6 ${p.status === 'suspended' ? 'pt-9' : ''}`}>
                {/* Avatar row */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${
                    p.role === 'doctor'
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {getInitials(p.full_name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-100 text-sm truncate" title={p.full_name}>
                      {p.full_name || 'Unnamed User'}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5" title={p.email}>{p.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        p.role === 'doctor'
                          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {p.role}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        p.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details strip */}
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3.5 mb-4">
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span className="text-zinc-400 font-medium">Department</span>
                    <span className="font-semibold text-zinc-300 text-right truncate">
                      {p.department || p.specialties?.name || '—'}
                    </span>
                    <span className="text-zinc-400 font-medium">Joined</span>
                    <span className="font-semibold text-zinc-300 text-right">
                      {new Date(p.created_at).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE,  month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/users/${p.id}`}
                    className="flex-1 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold rounded-lg py-2 text-xs text-center transition cursor-pointer"
                  >
                    View Profile
                  </Link>

                  {p.role !== 'ceo' && (
                    <div className="flex-1">
                      {p.status === 'suspended' ? (
                        <form action={reactivateUser}>
                          <input type="hidden" name="userId" value={p.id} />
                          <button type="submit" className="w-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-semibold rounded-lg py-2 text-xs transition cursor-pointer">
                            Reactivate
                          </button>
                        </form>
                      ) : (
                        <form action={suspendUser}>
                          <input type="hidden" name="userId" value={p.id} />
                          <button type="submit" className="w-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-semibold rounded-lg py-2 text-xs transition cursor-pointer">
                            Suspend
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-zinc-900 rounded-2xl border border-dashed border-zinc-800">
            <p className="text-sm text-zinc-500 font-medium italic">No active doctors or staff found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
