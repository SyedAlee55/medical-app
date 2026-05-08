'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * LOGIN ACTION
 */
export async function login(formData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return redirect('/login?error=' + encodeURIComponent(error.message))
    }

    // 1. Get the user's role from the profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    revalidatePath('/', 'layout')

    // 2. Redirect based on role
    if (profile?.role === 'doctor') {
        redirect('/employee/dashboard')
    } else {
        redirect('/patient/dashboard')
    }
}

/**
 * SIGNUP ACTION
 */
export async function signup(formData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')
    const fullName = formData.get('fullName') // New
    const role = formData.get('role') // New ('doctor' or 'patient')

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // This metadata is what the SQL Trigger uses to fill the 'profiles' table!
            data: {
                full_name: fullName,
                role: role,
            },
        },
    })

    if (error) return redirect('/login?error=' + encodeURIComponent(error.message))

    revalidatePath('/', 'layout')
    
    // Redirect based on the chosen role
    if (role === 'doctor') {
        redirect('/employee/dashboard')
    } else {
        redirect('/patient/dashboard')
    }
}

/**
 * SIGNOUT ACTION
 */
export async function signout() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}




// 🔍 What’s happening here ? (The Tech Breakdown)
// 'use server': This tells Next.js that these functions should never be sent to the user's browser. They stay safe on Vercel.

// formData.get('email'): We don't need to track inputs with useState. We just grab the values directly from the HTML form when the button is clicked.

// revalidatePath: This is crucial.It tells Next.js, "Hey, the user's login status just changed, please refresh the layout so the 'Login' button turns into a 'Logout' button."

// Error Handling: If the login fails, we use a URL parameter(?error =...).This allows your UI to display the error message without needing complex state management.