import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { suspendUser, reactivateUser, deleteUser } from '@/app/admin/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({ searchParams }) {
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

  const roleFilter = params?.role || 'All'
  const statusFilter = params?.status || 'All'

  // Fetch Users
  let query = supabase
    .from('profiles')
    .select('id, full_name, email, role, status, created_at, last_login_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (roleFilter !== 'All') {
    query = query.eq('role', roleFilter.toLowerCase())
  }
  if (statusFilter !== 'All') {
    query = query.eq('status', statusFilter.toLowerCase())
  }

  const { data: users, count } = await query

  const roles = ['All', 'Patient', 'Doctor', 'Staff']
  const statuses = ['All', 'Active', 'Pending', 'Suspended', 'Rejected']

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">{status}</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">{status}</Badge>
      case 'suspended': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">{status}</Badge>
      case 'rejected': return <Badge variant="destructive">{status}</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'patient': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{role}</Badge>
      case 'doctor': return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">{role}</Badge>
      case 'staff': return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200">{role}</Badge>
      default: return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-sm text-zinc-500 font-medium">Showing {count || 0} users</p>
      </div>

      {params?.success === 'suspended' && (
        <div className="p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md">
          User has been successfully suspended and their active sessions have been revoked.
        </div>
      )}
      
      {params?.success === 'reactivated' && (
        <div className="p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md">
          User has been successfully reactivated.
        </div>
      )}
      
      {params?.success === 'deleted' && (
        <div className="p-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md">
          User has been successfully deleted.
        </div>
      )}

      {params?.error === 'has_active_appointments' && (
        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
          Cannot delete user: They have active or pending appointments.
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-zinc-600">Role:</span>
            <div className="flex flex-wrap gap-2">
              {roles.map(r => (
                <Link key={r} href={`/admin/users?role=${r}&status=${statusFilter}`}>
                  <Badge variant={roleFilter === r ? 'default' : 'secondary'} className="cursor-pointer">
                    {r}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:block w-px bg-zinc-200 dark:bg-zinc-700"></div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-zinc-600">Status:</span>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <Link key={s} href={`/admin/users?role=${roleFilter}&status=${s}`}>
                  <Badge variant={statusFilter === s ? 'default' : 'secondary'} className="cursor-pointer">
                    {s}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="border rounded-md overflow-hidden bg-white dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Login</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users?.length > 0 ? (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-zinc-100">{u.full_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                    <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(u.status)}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${u.id}`}>View Profile</Link>
                      </Button>
                      
                      {u.role !== 'ceo' && u.status !== 'suspended' && (
                        <form action={suspendUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <Button variant="outline" size="sm" type="submit" className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 border-orange-200">
                            Suspend
                          </Button>
                        </form>
                      )}

                      {u.role !== 'ceo' && u.status === 'suspended' && (
                        <form action={reactivateUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <Button variant="outline" size="sm" type="submit" className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200">
                            Reactivate
                          </Button>
                        </form>
                      )}

                      {u.role !== 'ceo' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action is permanent and cannot be undone. This will delete the user's account, profile, and all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <form action={deleteUser}>
                                <input type="hidden" name="userId" value={u.id} />
                                <AlertDialogAction type="submit" className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
                              </form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
