import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { approveDoctor, rejectDoctor } from '@/app/admin/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2 } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application Reviews</h1>

      {params?.success === 'approved' && (
        <div className="p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md">
          Application approved successfully. The user can now access the portal.
        </div>
      )}
      
      {params?.success === 'rejected' && (
        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
          Application rejected.
        </div>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex gap-2">
            Pending
            {pendingApplicants?.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {pendingApplicants.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplicants?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4 opacity-80" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-zinc-100">No pending applications</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 text-center mt-1">
                You're all caught up! Any new doctor or staff sign-ups will appear here.
              </p>
            </div>
          ) : (
            pendingApplicants?.map((applicant) => (
              <Card key={applicant.id}>
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{applicant.full_name}</h3>
                      <Badge variant="outline" className="capitalize">{applicant.role}</Badge>
                    </div>
                    <p className="text-sm text-zinc-500">{applicant.email}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">Applied:</span> {new Date(applicant.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    <form action={rejectDoctor} className="flex-1 md:flex-none">
                      <input type="hidden" name="userId" value={applicant.id} />
                      <Button type="submit" variant="destructive" className="w-full">
                        Reject
                      </Button>
                    </form>
                    
                    <form action={approveDoctor} className="flex-1 md:flex-none">
                      <input type="hidden" name="userId" value={applicant.id} />
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        Approve
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardContent className="p-0">
              <div className="border rounded-md overflow-hidden bg-white dark:bg-zinc-900">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 font-medium">Full Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Reviewed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {reviewedApplicants?.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-zinc-100">
                          {applicant.full_name}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{applicant.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">{applicant.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={applicant.status === 'active' ? 'default' : 'destructive'} 
                            className={applicant.status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200' : ''}
                          >
                            {applicant.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {new Date(applicant.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {!reviewedApplicants?.length && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No reviewed applications found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
