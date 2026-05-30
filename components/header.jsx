import React from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/login/actions'
import { PageTitle } from './page-title-client'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initials = 'U'
  if (user && user.email) {
    initials = user.email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105 shadow-[0_0_12px_rgba(6,148,162,0.1)]">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2h4v10h10v4h-10v10h-4v-10H2v-4h10V2z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Tj&apos;s Medical Hub</span>
        </Link>

        {/* Page Title (passed or resolved from path) */}
        <span className="text-white/10 hidden sm:inline">|</span>
        <div className="text-zinc-300 font-medium text-sm">
          <PageTitle />
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Search Input (Desktop) */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/8 text-white placeholder-zinc-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500/55 border border-brand-400/20 shadow-[0_0_8px_rgba(6,148,162,0.2)]" />
            </button>

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
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Settings
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
