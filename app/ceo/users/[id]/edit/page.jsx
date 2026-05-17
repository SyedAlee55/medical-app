import { createClient } from '@/utils/supabase/server'
import { updateUserProfile } from '@/app/ceo/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditUserPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) redirect('/ceo/users')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ceo/users" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">← Back to users</Link>
        <h1 className="text-2xl font-bold">Edit Profile: {profile.full_name}</h1>
      </div>

      <form action={updateUserProfile} className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-6 rounded">
        <input type="hidden" name="userId" value={id} />

        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
          <input type="text" name="full_name" defaultValue={profile.full_name} className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-sm w-full" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
          <input type="email" name="email" defaultValue={profile.email} className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-sm w-full" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
          <input type="text" name="phone" defaultValue={profile.phone} className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-sm w-full" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Department</label>
          <input type="text" name="department" defaultValue={profile.department} className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-sm w-full" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Specialty ID</label>
          <input type="text" name="specialty_id" defaultValue={profile.specialty_id || ''} className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-sm w-full" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Employee ID</label>
          <input type="text" name="employee_id" defaultValue={profile.employee_id} className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-sm w-full" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Internal Notes (CEO Only)</label>
          <textarea name="notes" defaultValue={profile.notes} rows={4} className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-sm w-full" />
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded text-sm font-medium">Save Changes</button>
        </div>
      </form>
    </div>
  )
}
