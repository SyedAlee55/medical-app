import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch Profile Data (including role as absolute source of truth)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/login')
    }

    const role = profile.role

    // 3. Fetch Specialties (only needed if doctor, but small fetch)
    const { data: specialties } = await supabase
        .from('specialties')
        .select('id, name')
        .order('name')

    const isPatient = role === 'patient'

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
            <div className="max-w-4xl mx-auto">
                <ProfileForm 
                    profile={profile} 
                    specialties={specialties || []} 
                    role={role} 
                />
            </div>
        </div>
    )
}
