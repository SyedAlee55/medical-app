import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/login/actions'
import { PageTitle } from './page-title-client'
import NotificationBell from './notification-bell'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initials = 'U'
  let role = null

  if (user && user.email) {
    initials = user.email.substring(0, 2).toUpperCase()

    // Fetch role so the bell knows what type of notifications to show
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    role = profile?.role ?? null
  }

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes coin-flip-y {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        .animate-coin-flip {
          animation: coin-flip-y 4.5s linear infinite;
          transform-style: preserve-3d;
          backface-visibility: visible;
        }
      `}} />
      {/* Left: Logo + Page Title */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-400/30 flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_12px_rgba(6,148,162,0.1)] animate-coin-flip">
            <img src="/logo3.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Tj&apos;s Medical Hub</span>
        </Link>

        <span className="text-white/10 hidden sm:inline">|</span>
        <div className="text-zinc-300 font-medium text-sm">
          <PageTitle />
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Notification Bell — functional, role-aware */}
            {role && (
              <NotificationBell userId={user.id} role={role} />
            )}

            {/* User Avatar Dropdown */}
            <details className="relative group">
              <summary className="list-none cursor-pointer flex items-center focus:outline-none">
                <div className="w-9 h-9 rounded-full bg-white/5 text-zinc-350 border border-white/8 font-semibold text-sm flex items-center justify-center hover:bg-white/10 transition-colors">
                  {initials}
                </div>
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Signed in as</p>
                  <p className="text-xs font-medium text-zinc-300 truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  My Profile
                </Link>
                <div className="border-t border-white/5 my-1.5" />
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </details>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/schedule"
              className="bg-brand-500/10 backdrop-blur-md border border-brand-400/20 text-white font-semibold rounded-lg px-4 py-2 text-xs transition-all duration-200 shadow-[0_4px_12px_rgba(6,148,162,0.06)] hover:bg-brand-500/20 hover:border-brand-400/35 active:scale-[0.98]"
            >
              Book Appointment
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
