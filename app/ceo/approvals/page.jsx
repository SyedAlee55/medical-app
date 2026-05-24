import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ApprovalActions } from './client-actions'
import { CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const ROLE_CLASSES = {
  doctor: 'bg-brand-50 text-brand-700 border border-brand-100',
  staff:  'bg-indigo-50 text-indigo-700 border border-indigo-100',
}

export default async function ApprovalsPage() {
  const supabase = await createClient()

  const { data: applications } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, role, department, created_at,
      specialty:specialty_id(name)
    `)
    .eq('status', 'pending')
    .in('role', ['doctor', 'staff'])
    .order('created_at', { ascending: true })

  if (!applications?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Pending Approvals</h1>
          <p className="type-body text-zinc-500 text-sm mt-0.5">Review and action new staff applications</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
          <h3 className="text-base font-semibold text-zinc-900">No pending applications</h3>
          <p className="text-xs text-zinc-400 font-medium mt-1">Any new doctor or staff sign-ups will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Pending Approvals</h1>
        <p className="type-body text-zinc-500 text-sm mt-0.5">Review and action new staff applications</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Specialty / Dept</th>
                <th className="px-6 py-3">Applied On</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {applications.map(a => {
                const roleClass = ROLE_CLASSES[a.role] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                return (
                  <tr key={a.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{a.full_name || 'Unnamed'}</td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">{a.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>{a.role}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-medium">{a.department || a.specialty?.name || '—'}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400 font-medium">{formatDate(a.created_at)}</td>
                    <td className="px-6 py-4">
                      <ApprovalActions targetId={a.id} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
