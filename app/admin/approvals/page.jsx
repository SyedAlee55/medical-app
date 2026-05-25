import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { approveDoctor, rejectDoctor } from '@/app/admin/actions'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import ApprovalsTabs from '@/components/admin/approvals-tabs'

// Force dynamic so it re-fetches stats on every reload
export const dynamic = 'force-dynamic'

export default async function AdminApprovalsPage({ searchParams }) {
  const supabase = await createClient()
  const params = await searchParams

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

  // Fetch Pending Applicants
  const { data: pendingApplicants } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, role, department, created_at,
      specialties(name)
    `)
    .eq('status', 'pending')
    .in('role', ['doctor', 'staff'])
    .order('created_at', { ascending: true })

  // Fetch Reviewed Applicants
  const { data: reviewedApplicants } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, role, status, updated_at
    `)
    .in('status', ['active', 'rejected'])
    .in('role', ['doctor', 'staff'])
    .order('updated_at', { ascending: false })
    .limit(50)

  const ROLE_CLASSES = {
    doctor: 'bg-brand-50 text-brand-700 border border-brand-100',
    staff: 'bg-blue-50 text-blue-700 border border-blue-100',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Application Reviews</h1>
        <p className="type-body text-zinc-500 text-sm mt-0.5">Manage signup requests from healthcare providers and administrators</p>
      </div>

      {params?.success === 'approved' && (
        <div className="p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Application approved successfully. The user can now access the portal.</span>
        </div>
      )}
      
      {params?.success === 'rejected' && (
        <div className="p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Application rejected.</span>
        </div>
      )}

      <ApprovalsTabs
        pendingCount={pendingApplicants?.length ?? 0}
        pendingPanel={
          pendingApplicants?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
              <h3 className="text-base font-semibold text-zinc-900">No pending applications</h3>
              <p className="text-xs text-zinc-400 font-medium max-w-sm mt-1">
                You&apos;re all caught up! Any new doctor or staff sign-ups will appear here for review.
              </p>
            </div>
          ) : (
            pendingApplicants?.map((applicant) => {
              const roleClass = ROLE_CLASSES[applicant.role] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
              return (
                <div key={applicant.id} className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-semibold text-base text-zinc-900">{applicant.full_name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>
                        {applicant.role}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-400">{applicant.email}</p>
                    <p className="text-xs text-zinc-500 font-medium mt-2">
                      <span className="font-semibold text-zinc-700">Applied:</span> {new Date(applicant.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <form action={rejectDoctor} className="flex-1 md:flex-none">
                      <input type="hidden" name="userId" value={applicant.id} />
                      <button 
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2.5 text-xs transition duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] cursor-pointer"
                      >
                        Reject
                      </button>
                    </form>
                    
                    <form action={approveDoctor} className="flex-1 md:flex-none">
                      <input type="hidden" name="userId" value={applicant.id} />
                      <button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2.5 text-xs transition duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.98] cursor-pointer"
                      >
                        Approve
                      </button>
                    </form>
                  </div>
                </div>
              )
            })
          )
        }
        reviewedPanel={
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                    <th className="px-6 py-3">Full Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Reviewed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700 text-sm">
                  {reviewedApplicants?.map((applicant) => {
                    const roleClass = ROLE_CLASSES[applicant.role] || 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                    const statusClass = applicant.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                    return (
                      <tr key={applicant.id} className="hover:bg-zinc-50/50 transition">
                        <td className="px-6 py-4 font-semibold text-zinc-900">
                          {applicant.full_name}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-zinc-500">{applicant.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleClass}`}>
                            {applicant.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusClass}`}>
                            {applicant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-400 font-medium">
                          {new Date(applicant.updated_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    )
                  })}
                  {!reviewedApplicants?.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">
                        No reviewed applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
      />
    </div>
  )
}
