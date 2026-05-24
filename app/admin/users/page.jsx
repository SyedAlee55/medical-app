import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { suspendUser, reactivateUser, deleteUser } from '@/app/admin/actions'
import Link from 'next/link'
import { CheckCircle2, AlertCircle } from 'lucide-react'
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
      case 'active': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{status}</span>
      case 'pending': return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{status}</span>
      case 'suspended': return <span className="bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{status}</span>
      case 'rejected': return <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{status}</span>
      default: return <span className="bg-zinc-50 text-zinc-600 border border-zinc-200 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{status}</span>
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'patient': return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{role}</span>
      case 'doctor': return <span className="bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{role}</span>
      case 'staff': return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{role}</span>
      default: return <span className="bg-zinc-50 text-zinc-600 border border-zinc-200 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{role}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">User Management</h1>
          <p className="type-body text-zinc-500 text-sm mt-0.5">Control all user account access and roles</p>
        </div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Showing {count || 0} users</p>
      </div>

      {params?.success === 'suspended' && (
        <div className="p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>User has been successfully suspended and their active sessions have been revoked.</span>
        </div>
      )}
      
      {params?.success === 'reactivated' && (
        <div className="p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>User has been successfully reactivated.</span>
        </div>
      )}
      
      {params?.success === 'deleted' && (
        <div className="p-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>User has been successfully deleted.</span>
        </div>
      )}

      {params?.error === 'has_active_appointments' && (
        <div className="p-4 text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Cannot delete user: They have active or pending appointments.</span>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Role:</span>
          <div className="flex flex-wrap gap-2">
            {roles.map(r => {
              const active = roleFilter === r
              return (
                <Link key={r} href={`/admin/users?role=${r}&status=${statusFilter}`}>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full transition cursor-pointer ${
                    active 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}>
                    {r}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
        
        <div className="hidden md:block w-px h-6 bg-zinc-200"></div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => {
              const active = statusFilter === s
              return (
                <Link key={s} href={`/admin/users?role=${roleFilter}&status=${s}`}>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full transition cursor-pointer ${
                    active 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}>
                    {s}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700 text-sm">
              {users?.length > 0 ? (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{u.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-medium">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400 font-medium">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link 
                          href={`/admin/users/${u.id}`}
                          className="border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer"
                        >
                          View Profile
                        </Link>
                        
                        {u.role !== 'ceo' && u.status !== 'suspended' && (
                          <form action={suspendUser} className="inline">
                            <input type="hidden" name="userId" value={u.id} />
                            <button 
                              type="submit" 
                              className="border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer"
                            >
                              Suspend
                            </button>
                          </form>
                        )}

                        {u.role !== 'ceo' && u.status === 'suspended' && (
                          <form action={reactivateUser} className="inline">
                            <input type="hidden" name="userId" value={u.id} />
                            <button 
                              type="submit" 
                              className="border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer"
                            >
                              Reactivate
                            </button>
                          </form>
                        )}

                        {u.role !== 'ceo' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button 
                                className="border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white rounded-2xl p-6 border border-zinc-100">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-bold text-zinc-900 text-lg">Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-500 text-sm mt-2">
                                  This action is permanent and cannot be undone. This will delete the user&apos;s account, profile, and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-6 flex gap-3">
                                <AlertDialogCancel className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold hover:bg-zinc-50 cursor-pointer">Cancel</AlertDialogCancel>
                                <form action={deleteUser}>
                                  <input type="hidden" name="userId" value={u.id} />
                                  <AlertDialogAction type="submit" className="bg-red-600 text-white hover:bg-red-700 font-semibold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer">Delete</AlertDialogAction>
                                </form>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">
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
