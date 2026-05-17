import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { saveDoctorProfile } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default async function DoctorOnboardingPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, full_name, phone, specialty_id, department, bio, employee_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: specialties } = await supabase
    .from('specialties')
    .select('id, name')
    .order('name', { ascending: true })

  const params = await searchParams
  const hasError = params?.error === 'save_failed'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg border-t-4 border-t-blue-600 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Complete your professional profile
          </CardTitle>
          <p className="text-sm text-slate-500">
            Your profile will be reviewed by the administrator before your account is activated.
          </p>
        </CardHeader>
        <CardContent>
          {hasError && (
            <div className="mb-4 p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
              Something went wrong saving your profile. Please try again.
            </div>
          )}
          <form action={saveDoctorProfile} className="grid gap-4">

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" defaultValue={profile.full_name || ''} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={profile.phone || ''} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialty_id">Specialty</Label>
              <select
                id="specialty_id"
                name="specialty_id"
                defaultValue={profile.specialty_id || ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a specialty</option>
                {specialties?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" defaultValue={profile.department || ''} placeholder="e.g. Cardiology" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={profile.bio || ''}
                placeholder="Brief professional background and qualifications..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input id="employee_id" name="employee_id" defaultValue={profile.employee_id || ''} placeholder="Your hospital-issued ID" />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
              Submit profile for review
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
