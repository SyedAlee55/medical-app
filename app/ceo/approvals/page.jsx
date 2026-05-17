import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ApprovalActions } from './client-actions'

export const dynamic = 'force-dynamic'

function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ApprovalsPage() {
  const supabase = await createClient()

  // Technically the CEO portal prompt says "Fetches profiles where status = 'pending' AND role IN ('doctor','staff') AND email_confirmed_at IS NOT NULL". Wait, Sprint 2 prompt says:
  // "Fetches profiles where status = 'pending' AND role IN ('doctor','staff')"
  // Let's just do status='pending' and role in doctor, staff.
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
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">No pending applications.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
      
      <div className="border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Name</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Email</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Role</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Specialty/Dept</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Applied On</th>
              <th className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {applications.map(a => (
              <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-medium">{a.full_name || 'Unnamed'}</td>
                <td className="px-4 py-3 text-zinc-500">{a.email}</td>
                <td className="px-4 py-3 capitalize">{a.role}</td>
                <td className="px-4 py-3">{a.department || a.specialty?.name || '-'}</td>
                <td className="px-4 py-3">{formatDate(a.created_at)}</td>
                <td className="px-4 py-3">
                  <ApprovalActions targetId={a.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
