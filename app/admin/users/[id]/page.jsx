import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { suspendUser, reactivateUser, deleteUser } from '@/app/admin/actions'
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

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

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

const getAptStatusBadge = (status) => {
  switch (status) {
    case 'completed': return <Badge variant="outline">{status}</Badge>
    case 'confirmed': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{status}</Badge>
    case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">{status}</Badge>
    case 'cancelled': 
    case 'rejected': return <Badge variant="destructive">{status}</Badge>
    default: return <Badge variant="secondary">{status}</Badge>
  }
}

export default async function UserProfilePage({ params }) {
  const supabase = await createClient()
  const { id } = await params

  // Verify Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ceo')) {
    redirect('/403')
  }

  // Fetch Target Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      specialties(name)
    `)
    .eq('id', id)
    .single()

  if (!profile) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="mb-4 -ml-4 text-zinc-500">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-lg border border-dashed">
          <UserCircle2 className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">User Not Found</h2>
          <p className="text-zinc-500 mt-2">The requested profile does not exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  // Fetch Appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, status, reason_for_visit, notes')
    .or(`patient_id.eq.${id},doctor_id.eq.${id}`)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  const { count: blockingAppointmentsCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .or(`patient_id.eq.${id},doctor_id.eq.${id}`)
    .in('status', ['pending', 'confirmed'])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild className="-ml-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold
                  bg-gradient-to-br from-slate-100 to-zinc-200 text-slate-700 shadow-inner border border-white"
                >
                  {getInitials(profile.full_name)}
                </div>
                <div>
                  <CardTitle className="text-xl">{profile.full_name || 'Unnamed'}</CardTitle>
                  <p className="text-sm text-zinc-500">{profile.email}</p>
                </div>
              </div>
              
              {profile.role !== 'ceo' && (
                <div className="flex gap-2">
                  {profile.status === 'suspended' ? (
                    <form action={reactivateUser}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <Button variant="outline" size="sm" type="submit" className="text-emerald-600 hover:bg-emerald-50 border-emerald-200">
                        Reactivate
                      </Button>
                    </form>
                  ) : (
                    <form action={suspendUser}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <Button variant="outline" size="sm" type="submit" className="text-orange-600 hover:bg-orange-50 border-orange-200">
                        Suspend
                      </Button>
                    </form>
                  )}

                  {blockingAppointmentsCount > 0 ? null : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200">
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
                            <input type="hidden" name="userId" value={profile.id} />
                            <AlertDialogAction type="submit" className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {profile.role !== 'ceo' && blockingAppointmentsCount > 0 && (
                <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-md">
                  <h4 className="text-amber-800 font-semibold mb-1">Cannot Delete User</h4>
                  <p className="text-amber-700 text-sm">
                    This user cannot be deleted because they have <strong>{blockingAppointmentsCount}</strong> active or pending appointments. Resolve or cancel all appointments first before deleting this account.
                  </p>
                </div>
              )}

              <div className="flex gap-2 mb-6">
                {getRoleBadge(profile.role)}
                {getStatusBadge(profile.status)}
              </div>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-zinc-500 font-medium">Member Since</dt>
                  <dd className="text-slate-900 dark:text-zinc-100">{new Date(profile.created_at).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500 font-medium">Last Login</dt>
                  <dd className="text-slate-900 dark:text-zinc-100">{profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString() : 'Never'}</dd>
                </div>
                {profile.phone && (
                  <div>
                    <dt className="text-zinc-500 font-medium">Phone</dt>
                    <dd className="text-slate-900 dark:text-zinc-100">{profile.phone}</dd>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div>
                    <dt className="text-zinc-500 font-medium">Date of Birth</dt>
                    <dd className="text-slate-900 dark:text-zinc-100">{profile.date_of_birth}</dd>
                  </div>
                )}
                
                {['doctor', 'staff'].includes(profile.role) && (
                  <>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800"></div>
                    <div>
                      <dt className="text-zinc-500 font-medium">Department</dt>
                      <dd className="text-slate-900 dark:text-zinc-100">{profile.department || 'Not assigned'}</dd>
                    </div>
                    {profile.specialties?.name && (
                      <div>
                        <dt className="text-zinc-500 font-medium">Specialty</dt>
                        <dd className="text-slate-900 dark:text-zinc-100">{profile.specialties.name}</dd>
                      </div>
                    )}
                  </>
                )}

                {profile.bio && (
                  <>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800"></div>
                    <div>
                      <dt className="text-zinc-500 font-medium">Bio</dt>
                      <dd className="text-slate-900 dark:text-zinc-100 whitespace-pre-wrap mt-1">{profile.bio}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Appointments Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide border-y border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date & Time</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Reason</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {appointments?.length > 0 ? (
                      appointments.map(apt => (
                        <tr key={apt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-zinc-100">
                            {new Date(apt.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-3">{getAptStatusBadge(apt.status)}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-zinc-600 dark:text-zinc-300" title={apt.reason_for_visit}>
                            {apt.reason_for_visit || '-'}
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-zinc-500" title={apt.notes}>
                            {apt.notes || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                          No appointments found for this user.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
