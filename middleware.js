import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Refresh the session
    const { data: { user } } = await supabase.auth.getUser()

    const isDashboard = request.nextUrl.pathname.startsWith('/patient') ||
        request.nextUrl.pathname.startsWith('/employee')

    // 2. If NOT logged in and trying to access a protected dashboard
    if (!user && isDashboard) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Logic for logged-in users
    if (user) {
        const role = user.user_metadata?.role

        // Fix: If logged-in user tries to go to /login, redirect to their specific dashboard
        if (request.nextUrl.pathname === '/login') {
            const redirectUrl = role === 'doctor' ? '/employee/dashboard' : '/patient/dashboard'
            return NextResponse.redirect(new URL(redirectUrl, request.url))
        }

        // Role Protection: Patients can't enter employee areas
        if (request.nextUrl.pathname.startsWith('/employee') && role !== 'doctor') {
            return NextResponse.redirect(new URL('/patient/dashboard', request.url))
        }

        // Role Protection: Doctors can't enter patient areas
        if (request.nextUrl.pathname.startsWith('/patient') && role !== 'patient') {
            return NextResponse.redirect(new URL('/employee/dashboard', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}