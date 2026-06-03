import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PatientOnboardingForm from './PatientOnboardingForm'

export default async function PatientOnboardingPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const hasError = params?.error === 'save_failed'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <PatientOnboardingForm hasError={hasError} />
    </div>
  )
}