import { createClient } from '@/utils/supabase/server'
import { updateUserProfile } from '@/app/admin/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EditUserPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) redirect('/admin/users')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/users/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <span className="text-zinc-800">/</span>
        <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Edit Profile</h1>
      </div>

      <form action={updateUserProfile} className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm text-zinc-300">
        <input type="hidden" name="userId" value={id} />

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
          <input type="text" name="full_name" defaultValue={profile.full_name || ''} className="border border-zinc-800 bg-zinc-950 text-zinc-100 p-2.5 rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</label>
          <input type="email" name="email" defaultValue={profile.email || ''} className="border border-zinc-800 bg-zinc-950 text-zinc-100 p-2.5 rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Phone</label>
          <input type="text" name="phone" defaultValue={profile.phone || ''} className="border border-zinc-800 bg-zinc-950 text-zinc-100 p-2.5 rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Department</label>
          <input type="text" name="department" defaultValue={profile.department || ''} className="border border-zinc-800 bg-zinc-950 text-zinc-100 p-2.5 rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Specialty ID</label>
          <input type="text" name="specialty_id" defaultValue={profile.specialty_id || ''} className="border border-zinc-800 bg-zinc-950 text-zinc-100 p-2.5 rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Employee ID</label>
          <input type="text" name="employee_id" defaultValue={profile.employee_id || ''} className="border border-zinc-800 bg-zinc-950 text-zinc-100 p-2.5 rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-zinc-700 transition" />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Internal Notes (CEO/Admin Only)</label>
          <textarea name="notes" defaultValue={profile.notes || ''} rows={4} className="border border-zinc-800 bg-zinc-950 text-zinc-100 p-2.5 rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-zinc-700 transition resize-none" />
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-5 py-2.5 text-xs transition cursor-pointer">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
