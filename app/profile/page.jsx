import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()

    // 1. Get User and Role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    const role = user.user_metadata?.role

    // 2. Fetch Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 3. Fetch Specialties (only needed if doctor, but small fetch)
    const { data: specialties } = await supabase
        .from('specialties')
        .select('id, name')
        .order('name')

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                        Account Information
                    </h1>
                    <p className="mt-3 text-xl text-slate-500">
                        Managing your profile as a <span className="font-bold text-blue-600 capitalize">{role}</span>
                    </p>
                </div>

                <ProfileForm 
                    profile={profile} 
                    specialties={specialties || []} 
                    role={role} 
                />
            </div>
        </div>
    )
}
