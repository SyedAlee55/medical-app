import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeIdFilter from './filter'
import { EmployeeIdActions } from './client-actions'
import { BadgeCheck, XCircle, CheckCircle2 } from 'lucide-react'
import { GLOBAL_TIMEZONE } from '@/utils/time'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', { timeZone: GLOBAL_TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' })
}

const ROLE_CLASSES = {
  doctor: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
  staff:  'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
}

export default async function EmployeeIdsPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  // Verify role
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

  const filter = params.filter || 'unverified'

  let query = supabase
    .from('profiles')
    .select(`id, full_name, role, employee_id, employee_id_verified, employee_id_verified_at`)
    .in('role', ['doctor', 'staff'])
    .not('employee_id', 'is', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filter === 'verified')   query = query.eq('employee_id_verified', true)
  if (filter === 'unverified') query = query.eq('employee_id_verified', false)

  const { data: employees } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Employee ID Verification</h1>
        <p className="type-body text-zinc-400 text-sm mt-0.5">Verify and manage hospital-issued IDs for doctors and staff</p>
      </div>

      {params?.success === 'verified' && (
        <div className="p-4 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Employee ID verified successfully.</span>
        </div>
      )}
      {params?.success === 'rejected' && (
        <div className="p-4 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Employee ID verification has been rejected and cleared.</span>
        </div>
      )}

      <EmployeeIdFilter />

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Employee ID</th>
                <th className="px-6 py-3">Verified</th>
                <th className="px-6 py-3">Verified At</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300 text-sm">
              {employees?.map(e => {
                const roleClass = ROLE_CLASSES[e.role] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-800'
                return (
                  <tr key={e.id} className="hover:bg-zinc-800/20 transition">
                    <td className="px-6 py-4 font-semibold text-zinc-100">{e.full_name || 'Unnamed'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>{e.role}</span>
                    </td>
                    <td className={`px-6 py-4 font-mono text-xs font-semibold ${e.employee_id_verified ? 'text-zinc-500' : 'text-zinc-100'}`}>
                      {e.employee_id || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {e.employee_id_verified ? (
                         <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                          <BadgeCheck className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-zinc-500 font-semibold text-xs">
                          <XCircle className="w-4 h-4" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-400">{formatDate(e.employee_id_verified_at)}</td>
                    <td className="px-6 py-4">
                      <EmployeeIdActions targetId={e.id} isVerified={e.employee_id_verified} />
                    </td>
                  </tr>
                )
              })}
              {!employees?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
